import React, { useState, useEffect } from "react";
import uuid from 'react-uuid';
import capitalize from "capitalize";
import { DEFAULT_STATE, BUNGIE_APP_ID, API_KEY, TOKEN_URL, AUTHORIZE_URL, LOCATIONS, ACTIVITIES, WEAPONS, ELEMENTS, ENEMIES, ALL_KEYS } from './Constants';
import { getData } from "./DataHelper";
import { BountyCard } from "./BountyCard";
import { withRouter } from "react-router-dom";
import { Button, Accordion, AccordionSummary, AccordionDetails, Typography, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => {
    return {
        button: {
            marginRight: theme.spacing(),
            marginBottom: theme.spacing()
        },
        details: {
            padding: 0,
            display: 'block'
        }
    };
});

const ListView = ({ logout, match, history }) => {
    const classes = useStyles();
    const [ state, setState ] = useState({ ...DEFAULT_STATE, filter: match.params.filter });
    const [ loadingProgress, setLoadingProgress ] = useState(10);

    useEffect(() => {
        (async () => {
            try {
                const data = await getData(setLoadingProgress);
                setState({ ...state, ...data, loading: false });
            } catch (e) {
                console.dir(e);
                if(e.response && e.response.status == 401){
                    logout();
                }
            }
        })();
    }, []);

    const filter = (newFilter) => {
        if(state.filter !== newFilter){
            history.push(`/filter/${newFilter}`);
            setState({ ...state, filter: newFilter });
        }
    };

    let jsxArray = [];
    let mostBounties = -1;
    if(!state.loading){
        const locationsToLoop = !state.filter || state.filter === 'all' ? [ ...LOCATIONS, ...ACTIVITIES ] : [state.filter];
        locationsToLoop.forEach((LOCATION_KEY) => {
            const locationObject = state.locationFilterMapGrouped[LOCATION_KEY];
            if(locationObject && Object.keys(locationObject).length > 0){
                const sortedLocationKeys = Object.keys(state.locationFilterMapGrouped[LOCATION_KEY]).sort((a, b) => {
                    return state.locationFilterMapGrouped[LOCATION_KEY][b].length - state.locationFilterMapGrouped[LOCATION_KEY][a].length;
                });
                
                sortedLocationKeys.forEach((KEY) => {
                    const list = state.locationFilterMapGrouped[LOCATION_KEY][KEY];
                    const totalBounties = list.length;
                    if(!jsxArray[totalBounties]){
                        jsxArray[totalBounties] = [];
                    }
                    if(totalBounties > mostBounties){
                        mostBounties = totalBounties;
                    }
                    jsxArray[totalBounties].push(
                        <Accordion key={uuid()}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <Typography variant="h6">{capitalize.words(KEY.split('_').join(' ') + ' bounties') + ' in ' + capitalize.words(LOCATION_KEY.split('_').join(' ')) + ' (' + list.length + ')'}</Typography>
                            </AccordionSummary>
                            <AccordionDetails className={classes.details}>
                                { list.map((bounty) => {
                                    return (
                                        <BountyCard key={uuid()} bounty={bounty}></BountyCard>
                                    );
                                })}
                            </AccordionDetails>
                        </Accordion>
                    );
                    
                });
            }
        });
    }

    return (
        <>
            { !state.loading && 
                <div>
                    <div style={{ margin: '1em' }}>
                        <div style={{ marginBottom: '1em' }}>
                            { [ 'all', ...LOCATIONS, ...ACTIVITIES ].filter((location) => location === 'all' || Object.keys(state.locationFilterMapGrouped[location]).length > 0).map((location) => {
                                return (
                                    <Button 
                                        key={uuid()} 
                                        className={classes.button} 
                                        variant={ state.filter === location ? "contained" : "outlined"} 
                                        color={ state.filter === location ? "primary" : "secondary"} 
                                        onClick={() => filter(location)}>{location.split('_').join(' ')}
                                    </Button>
                                );
                            }) }
                        </div>
                    </div>
                    <div style={{ margin: '1em' }}>
                        { jsxArray.filter((jsx) => jsx !== undefined).reverse() }
                    </div>
                </div>
            }
            { state.loading &&
                <LinearProgress variant="determinate" value={loadingProgress} />
            }
        </>
    );
};

export default withRouter(ListView);