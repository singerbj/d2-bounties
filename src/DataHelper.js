import axios from 'axios';
import { DEFAULT_STATE, BUNGIE_APP_ID, API_KEY, TOKEN_URL, AUTHORIZE_URL, LOCATIONS, ACTIVITIES, WEAPONS, ELEMENTS, ENEMIES, ALL_KEYS } from './Constants';

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


export const getData = async () => {
    const manifestRes = await getManifest();
    const membershipRes = await getMembershipInfo();

    const inventoryItemDefinitionRes = await getManifestMap(manifestRes.data.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition);
    const inventoryItemDefinition = inventoryItemDefinitionRes.data;
    const mostRecentMembership = membershipRes.data.Response.destinyMemberships[0];
    const profileRes = await getProfile(mostRecentMembership.membershipType, mostRecentMembership.membershipId);
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
                location,
                relevantKeys,
                overallProgress
            };
            
            // only include unfinished bounties
            if(overallProgress < 1){
                bountiesOwned.push(bounty);
            }

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
    });

    const locationFilterMapGrouped = {};
    // Object.keys(locationFilterMap).forEach((LOCATION_KEY) => {
    [...LOCATIONS, ...ACTIVITIES].forEach((LOCATION_KEY) => {
        locationFilterMapGrouped[LOCATION_KEY] = {};
        [...WEAPONS, ...ELEMENTS, ...ENEMIES].forEach((KEY) => {
            if(locationFilterMap[LOCATION_KEY]){
                locationFilterMap[LOCATION_KEY].forEach((bounty) => {
                    if(bounty.relevantKeys.indexOf(KEY) >= 0){
                        if(!locationFilterMapGrouped[LOCATION_KEY][KEY]){
                            locationFilterMapGrouped[LOCATION_KEY][KEY] = [];
                        }
                        locationFilterMapGrouped[LOCATION_KEY][KEY].push(bounty);
                    }
                });
            }
            if(LOCATIONS.indexOf(LOCATION_KEY) >= 0){
                bountiesWithNoLocationOrLimit.forEach((bounty) => {
                    if(bounty.relevantKeys.indexOf(KEY) >= 0){
                        if(!locationFilterMapGrouped[LOCATION_KEY][KEY]){
                            locationFilterMapGrouped[LOCATION_KEY][KEY] = [];
                        }
                        locationFilterMapGrouped[LOCATION_KEY][KEY].push(bounty);
                    }
                });
            }
        });
    });

    // build the list of bounty strings to debug classification of some bounties
    const bountyStrings = [];
    Object.keys(inventoryItemDefinition).forEach((itemId) => {
        const item = inventoryItemDefinition[itemId];
        // 12 is quest step, 26 is bounty
        if([26].indexOf(item.itemType) >= 0){
            bountyStrings.push(item.inventory.stackUniqueLabel);
        }
    });

    return { bountiesOwned, bountyStrings, objectiveMap, locationFilterMap, locationFilterMapGrouped };
}