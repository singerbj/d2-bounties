import axios from 'axios';
import { DEFAULT_STATE, BUNGIE_APP_ID, API_KEY, TOKEN_URL, AUTHORIZE_URL, LOCATIONS, ACTIVITIES, PVP_ONLY_ACTIVITIES, WEAPONS, ALL_ELEMENTAL, ELEMENTS, ENEMIES, ALL_KEYS } from './Constants';

const getMembershipInfo = async () => {
    return await axios.get('https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/', {
        headers: {
            'X-API-Key': API_KEY,
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')).access_token,
        }
    })
};

const getProfile = async (membershipType, destinyMembershipId) => {
    return await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=102,104,200,201,202,204,300,301,304,400,401,402`, {
        headers: {
            'X-API-Key': API_KEY,
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')).access_token,
        }
    })
};

const getManifest = async () => {
    return await axios.get('https://www.bungie.net/Platform/Destiny2/Manifest/', {
        headers: {
            'X-API-Key': API_KEY,
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')).access_token,
        }
    })
};

const getManifestMap = async (url) => {
    return await axios.get('https://www.bungie.net' + url);
};

const getCharacter = async (membershipType, destinyMembershipId, characterId) => {
    return await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/?components=102,200,201,202,204,300,301,304,400,401,402`, {
        headers: {
            'X-API-Key': API_KEY,
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')).access_token,
        }
    })
};

// const getActivityHistory = async (membershipType, destinyMembershipId, characterId) => {
//     return await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/Activities/?page=0`, {
//         headers: {
//             'X-API-Key': API_KEY,
//             // 'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')).access_token,
//         }
//     })
// };

let manifestRes;
let membershipRes;
let inventoryItemDefinitionRes;

export const getData = async (setLoadingProgress, isOnPageRefresh) => {
    if(!manifestRes || !isOnPageRefresh){
        manifestRes = await getManifest();
    }
    setLoadingProgress(20);
    if(!membershipRes || !isOnPageRefresh){
        membershipRes = await getMembershipInfo();

    }
    setLoadingProgress(40);
    if(!inventoryItemDefinitionRes || !isOnPageRefresh){
        inventoryItemDefinitionRes = await getManifestMap(manifestRes.data.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition);
    }
    setLoadingProgress(50);
    const inventoryItemDefinition = inventoryItemDefinitionRes.data;
    const mostRecentMembership = membershipRes.data.Response.destinyMemberships[0];
    const profileRes = await getProfile(mostRecentMembership.membershipType, mostRecentMembership.membershipId);
    setLoadingProgress(70);
    const firstCharacterId = Object.keys(profileRes.data.Response.characters.data)[0];
    const firstCharacter = await getCharacter(mostRecentMembership.membershipType, mostRecentMembership.membershipId, firstCharacterId);

    // build map of objectives to get progress for bounty items
    const objectiveMap = {};
    const topObjectives = firstCharacter.data.Response.itemComponents.objectives.data;
    Object.keys(topObjectives).forEach((topObjectiveKey) => {
        topObjectives[topObjectiveKey].objectives.forEach((objective) => {
            objectiveMap[objective.objectiveHash] = objective;
        });
    });

    // build a list of owned bounties
    const firstCharacterItems = profileRes.data.Response.characterInventories.data[firstCharacterId].items;
    const bountiesOwned = [];
    const locationFilterMap = {};
    const bountiesWithNoLocationOrLimit = [];
    firstCharacterItems.forEach((item) => {
        const itemDefinition = inventoryItemDefinition[item.itemHash];
        // 12 is quest step, 26 is bounty
        if([26].indexOf(itemDefinition.itemType) >= 0){
            const relevantKeys = ALL_KEYS.filter((KEY) => {
                let relevantFromLabel;
                let relevantFromDescription;
                const bLabelText = itemDefinition.inventory.stackUniqueLabel.toLowerCase();
                const bDescText = itemDefinition.displayProperties.description.split(' ').join('_').toLowerCase();
                if((typeof KEY) === 'object'){
                    relevantFromLabel = (bLabelText.indexOf(KEY.text) >= 0) && (bLabelText.indexOf(KEY.not) === -1);
                    relevantFromDescription = (bDescText.indexOf(KEY.text) >= 0) && (bDescText.indexOf(KEY.not) === -1);
                } else {
                    relevantFromLabel = bLabelText.indexOf(KEY) >= 0
                    relevantFromDescription = bDescText.indexOf(KEY) >= 0
                }
                return relevantFromLabel || relevantFromDescription;
            }).map((KEY) => {
                return (typeof KEY) === 'object' ? KEY.text : KEY;
            });
            const objectiveArray = itemDefinition.objectives.objectiveHashes.map((oH) => {
                return objectiveMap[oH].progress / objectiveMap[oH].completionValue;
            });
            const overallProgress = objectiveArray.reduce((a, b) => a + b) / objectiveArray.length;
            const location = [ ...LOCATIONS, ...ACTIVITIES ].filter((KEY) => { return relevantKeys.indexOf(KEY) >= 0})[0];

            const bounty = {
                itemHash: itemDefinition.itemHash,
                name: itemDefinition.displayProperties.name,
                description: itemDefinition.displayProperties.description,
                icon: itemDefinition.displayProperties.icon,
                itemType: itemDefinition.itemType,
                stackUniqueLabel: itemDefinition.inventory.stackUniqueLabel,
                location,
                relevantKeys,
                overallProgress
            };
            
            // only include unfinished bounties
            if(overallProgress < 1){
                bountiesOwned.push(bounty);

                // build map for locations/activities
                if(location){
                    if(!locationFilterMap[location]){
                        locationFilterMap[location] = [];
                    }
                    locationFilterMap[location].push(bounty);
                } else {
                    bountiesWithNoLocationOrLimit.push(bounty);
                }
            }
        }
    });

    setLoadingProgress(90);

    // const locationFilterMapGrouped = {};
    // // Object.keys(locationFilterMap).forEach((LOCATION_KEY) => {
    // [...LOCATIONS, ...ACTIVITIES].forEach((LOCATION_KEY) => {
    //     locationFilterMapGrouped[LOCATION_KEY] = {};
    //     [...WEAPONS, ...ALL_ELEMENTAL, ...ELEMENTS, ...ENEMIES].forEach((KEY) => {
    //         if(locationFilterMap[LOCATION_KEY]){
    //             locationFilterMap[LOCATION_KEY].forEach((bounty) => {
    //                 if(bounty.relevantKeys.indexOf(KEY) >= 0){
    //                     if(!locationFilterMapGrouped[LOCATION_KEY][KEY]){
    //                         locationFilterMapGrouped[LOCATION_KEY][KEY] = [];
    //                     }
    //                     locationFilterMapGrouped[LOCATION_KEY][KEY].push(bounty);
    //                 }
    //             });
    //         }
    //         if(PVP_ONLY_ACTIVITIES.indexOf(LOCATION_KEY) === -1){
    //             bountiesWithNoLocationOrLimit.forEach((bounty) => {
    //                 if(bounty.relevantKeys.indexOf(KEY) >= 0){
    //                     if(!locationFilterMapGrouped[LOCATION_KEY][KEY]){
    //                         locationFilterMapGrouped[LOCATION_KEY][KEY] = [];
    //                     }
    //                     locationFilterMapGrouped[LOCATION_KEY][KEY].push(bounty);
    //                 }
    //             });
    //         }
    //     });
    // });


    // location/activity - elemental - weapon - enemy
    const detailedMap = {};
    // Object.keys(locationFilterMap).forEach((LOCATION_KEY) => {
    [...LOCATIONS, ...ACTIVITIES].forEach((LOCATION_ACTIVITY_KEY) => {
        detailedMap[`${LOCATION_ACTIVITY_KEY}`] = [];
        ELEMENTS.forEach((ELEMENT) => {
            detailedMap[`${LOCATION_ACTIVITY_KEY}~${ELEMENT}`] = [];
            WEAPONS.forEach((WEAPON) => {
                const weaponKeyToUse = (typeof WEAPON) === 'object' ? WEAPON.text : WEAPON;
                detailedMap[`${LOCATION_ACTIVITY_KEY}~${ELEMENT}~${weaponKeyToUse}`] = [];
                if(PVP_ONLY_ACTIVITIES.indexOf(LOCATION_ACTIVITY_KEY) === -1){
                    ENEMIES.forEach((ENEMY) => {
                        detailedMap[`${LOCATION_ACTIVITY_KEY}~${ELEMENT}~${weaponKeyToUse}~${ENEMY}`] = [];
                    });
                }
            });
        });
    });

    setLoadingProgress(93);

    Object.keys(detailedMap).forEach((detailedKey) => {
        const keys = detailedKey.split('~');
        bountiesOwned.forEach((bounty) => {
            let relevantKeys = [ ...bounty.relevantKeys ];
            let elementalPresent = relevantKeys.indexOf(ALL_ELEMENTAL[0]) > -1;
            if(elementalPresent){
                relevantKeys = relevantKeys.filter((KEY) => KEY !== ALL_ELEMENTAL[0]);
                relevantKeys = [ ...relevantKeys, ...ELEMENTS ];
            }

            let difference = relevantKeys.filter(x => !keys.includes(x));
            if(elementalPresent){
                difference = difference.filter((key) => ELEMENTS.indexOf(key) === -1);
            }
            if(difference.length === 0){
                detailedMap[detailedKey].push(bounty)
            }
        });
    });

    setLoadingProgress(96);

    const allDetailedKeys = Object.keys(detailedMap).sort((a, b) => b.split('~').length - a.split('~').length);
    allDetailedKeys.forEach((detailedKeyA) => {
        allDetailedKeys.forEach((detailedKeyB) => {
            if(detailedKeyA !== detailedKeyB){
                const a = detailedMap[detailedKeyA];
                const b = detailedMap[detailedKeyB];

                if(!a || a.length < 2){
                    delete detailedMap[detailedKeyA];
                    return;
                }
                if(!b || b.length < 2){
                    delete detailedMap[detailedKeyB];
                    return;
                }
                if(detailedKeyA.indexOf(detailedKeyB) > -1 || detailedKeyB.indexOf(detailedKeyA) > -1 ){
                    if(a.length > b.length){
                        delete detailedMap[detailedKeyB];
                    } else if(a.length < b.length){
                        delete detailedMap[detailedKeyA];
                    } else {
                        if(detailedKeyA.length < detailedKeyB.length){
                            delete detailedMap[detailedKeyB];
                        } else if(detailedKeyA.length > detailedKeyB.length) {
                            delete detailedMap[detailedKeyA];
                        } else {
                            // should never get here
                        }
                    }
                }
            }
        });
    });

    setLoadingProgress(99);

    const detailedMapLocationsActivities = {};
    Object.keys(detailedMap).forEach((detailedKey) => {
        const location = detailedKey.split('~')[0];
        const remainingDetailedKey = detailedKey.split('~').splice(1, detailedKey.split('~').length - 1).join('~');
        const detailedEntry = detailedMap[detailedKey];
        if(!detailedMapLocationsActivities[location]){
            detailedMapLocationsActivities[location] = {};
        }
        detailedMapLocationsActivities[location][remainingDetailedKey] = detailedEntry.sort((a, b) => {
            var nameA = a.name.toUpperCase(); // ignore upper and lowercase
            var nameB = b.name.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        })
    });

    setLoadingProgress(100);

    return { bountiesOwned, objectiveMap, locationFilterMap, detailedMapLocationsActivities };
}