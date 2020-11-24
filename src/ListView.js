import React, { useState, useEffect } from "react";
import uuid from 'react-uuid';
import { DEFAULT_STATE, BUNGIE_APP_ID, API_KEY, TOKEN_URL, AUTHORIZE_URL, LOCATIONS, ACTIVITIES, WEAPONS, ELEMENTS, ENEMIES, ALL_KEYS } from './Constants';
import { getData } from "./DataHelper";
import { BountyCard } from "./BountyCard";

const App = ({ logout }) => {
    const [ state, setState ] = useState(DEFAULT_STATE);

    useEffect(() => {
        (async () => {
            try {
                const data = await getData();
                setState({ ...state, ...data, loading: false });
            } catch (e) {
                console.dir(e);
                if(e.response && e.response.status == 401){
                    logout();
                }
            }
        })();
    }, []);

    const filter = (e) => {
        setState({ ...state, filter: e.target.value });
    };

    let jsxArray = [];
    if(!state.loading){
        if(!state.filter){
            [ ...LOCATIONS, ...ACTIVITIES ].forEach((LOCATION_KEY) => {
                if(state.locationFilterMapGrouped[LOCATION_KEY]){
                    const sortedLocationKeys = Object.keys(state.locationFilterMapGrouped[LOCATION_KEY]).sort((a, b) => {
                        return state.locationFilterMapGrouped[LOCATION_KEY][b].length - state.locationFilterMapGrouped[LOCATION_KEY][a].length;
                    });
                    sortedLocationKeys.forEach((KEY) => {
                        jsxArray.push(
                            <h2 key={uuid()} style={{ background: "#ccc", color: "#333", padding: "0.25em" }}>
                                {LOCATION_KEY.split('_').join(' ')}: {KEY.split('_').join(' ')} bounties
                            </h2>
                        );
                        state.locationFilterMapGrouped[LOCATION_KEY][KEY].forEach((bounty) => {
                            jsxArray.push(<BountyCard key={uuid()} bounty={bounty}></BountyCard>);
                        })
                        jsxArray.push(<hr key={uuid()} />);
                    });
                }
            });
        } else {
            if(state.locationFilterMapGrouped[state.filter]){
                const sortedLocationKeys = Object.keys(state.locationFilterMapGrouped[state.filter]).sort((a, b) => {
                    return state.locationFilterMapGrouped[state.filter][b].length - state.locationFilterMapGrouped[state.filter][a].length;
                });
                sortedLocationKeys.forEach((KEY) => {
                    jsxArray.push(
                        <h2 key={uuid()} style={{ background: "#ccc", color: "#333", padding: "0.25em" }}>{
                            KEY.split('_').join(' ')} bounties
                        </h2>
                    );
                    state.locationFilterMapGrouped[state.filter][KEY].forEach((bounty) => {
                        jsxArray.push(<BountyCard key={uuid()} bounty={bounty}></BountyCard>);
                    })
                    jsxArray.push(<hr key={uuid()} />);
                });
            } else {
                jsxArray.push(<div key={uuid()}>No relevant bounties found for filter: {state.filter.split('_').join(' ')}</div>);
            }
        }
    }

    return (
        <>
            { !state.loading && 
                <div>
                    <div style={{ margin: '1em' }}>
                        <div style={{ marginBottom: '1em' }}>
                            <button key={uuid()} onClick={filter}>all</button>
                            { [ ...LOCATIONS, ...ACTIVITIES ].map((location) => {
                                return (
                                    <button key={uuid()} value={location} onClick={filter}>{location.split('_').join(' ')}</button>
                                );
                            }) }
                        </div>
                        <div>
                            Current Filter: {state.filter ? state.filter.split('_').join(' ') : 'None'}
                        </div>
                    </div>
                    <div style={{ margin: '1em' }}>
                        { jsxArray }


                        {/* <hr/>
                        <hr/>
                        <hr/>
                        { state.bountyStrings && state.bountyStrings.map((bountyString) => {
                            return (
                                <div key={uuid()}>
                                    {bountyString}
                                    <hr/>
                                </div>
                            );
                        })} */}
                    </div>
                </div>
            }
            { state.loading &&
                <div>
                    <div>Data Loading...</div>
                </div>
            }
        </>
    );
};

export default App;