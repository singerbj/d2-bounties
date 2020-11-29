import React, { useState, useEffect } from 'react';
import uuid from 'react-uuid';
import capitalize from 'capitalize';
import { withRouter } from 'react-router-dom';
import {
    Paper,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    LinearProgress,
    Select,
    MenuItem,
    Box,
    Divider,
    Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RefreshIcon from '@material-ui/icons/Refresh';
import PropTypes from 'prop-types';
import { BountyCard } from './BountyCard';
import { getData } from './DataHelper';
import {
    LOCALE,
    WHERE,
    DEFAULT_STATE,
    LOCATIONS,
    ACTIVITIES,
    MAX_LIST_LENGTH,
    MAX_ALL_LENGTH,
} from './Constants';

const useStyles = makeStyles((theme) => {
    return {
        details: {
            padding: 0,
            display: 'block',
        },
        controls: {
            margin: theme.spacing(2),
        },
        controlPaper: {
            padding: `${theme.spacing()}px ${theme.spacing()}px`,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                maxWidth: 400,
            },
        },
        input: {
            marginLeft: theme.spacing(),
            marginRight: theme.spacing(),
            flex: 1,
        },
        iconButton: {
            padding: theme.spacing(),
        },
        divider: {
            height: 28,
            margin: theme.spacing(),
        },
        listOuterContainer: {
            margin: theme.spacing(2),
        },
        listInnerContainer: {
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                maxWidth: 600,
            },
        },
        grid: {
            height: '75vh',
        },
        summaryBox: {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
        },
        numberOfBounties: {
            marginLeft: theme.spacing(),
        },
    };
});

const filterOptions = ['all', ...LOCATIONS, ...ACTIVITIES];

const ListView = ({ logout, match, history }) => {
    const classes = useStyles();
    const [state, setState] = useState({
        ...DEFAULT_STATE,
        filter:
            filterOptions.indexOf(match.params.filter) > -1
                ? match.params.filter
                : 'all',
    });
    const [loadingProgress, setLoadingProgress] = useState(10);

    const refresh = async (isOnPageRefresh) => {
        setState({ ...state, loading: true });
        try {
            const data = await getData(setLoadingProgress, isOnPageRefresh);
            setState({ ...state, ...data, loading: false });
        } catch (e) {
            if (e.response && e.response.status === 401) {
                logout();
            }
        }
    };

    const filter = (newFilter) => {
        if (state.filter !== newFilter) {
            history.push(`/${newFilter}`);
            setState({ ...state, filter: newFilter });
        }
    };

    useEffect(() => {
        if (filterOptions.indexOf(match.params.filter) === -1) {
            history.push('/all');
        }
        refresh();
    }, []);

    const jsxArray = [];
    let mostBounties = -1;
    if (!state.loading) {
        const locationsToLoop =
            !state.filter || state.filter === 'all'
                ? [...LOCATIONS, ...ACTIVITIES]
                : [state.filter];
        locationsToLoop.forEach((LOCATION_KEY) => {
            const locationObject =
                state.detailedMapLocationsActivities[LOCATION_KEY];
            if (locationObject && Object.keys(locationObject).length > 0) {
                const sortedLocationKeys = Object.keys(
                    state.detailedMapLocationsActivities[LOCATION_KEY]
                ).sort((a, b) => {
                    return (
                        state.detailedMapLocationsActivities[LOCATION_KEY][b]
                            .length -
                        state.detailedMapLocationsActivities[LOCATION_KEY][a]
                            .length
                    );
                });

                sortedLocationKeys
                    .slice(
                        0,
                        state.filter === 'all'
                            ? MAX_ALL_LENGTH
                            : MAX_LIST_LENGTH
                    )
                    .forEach((KEY) => {
                        const list =
                            state.detailedMapLocationsActivities[LOCATION_KEY][
                                KEY
                            ];
                        const totalBounties = list.length;
                        if (!jsxArray[totalBounties]) {
                            jsxArray[totalBounties] = [];
                        }
                        if (totalBounties > mostBounties) {
                            mostBounties = totalBounties;
                        }
                        jsxArray[totalBounties].push(
                            <Accordion
                                key={uuid()}
                                TransitionProps={{ unmountOnExit: true }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                >
                                    <Box className={classes.summaryBox}>
                                        <Box>
                                            <Typography variant="h6">
                                                {capitalize.words(
                                                    `${KEY.split('_')
                                                        .join(' ')
                                                        .split('~')
                                                        .join(' ')} bounties`
                                                )}
                                            </Typography>
                                            <Typography variant="body2">
                                                {WHERE[LOCATION_KEY]}
                                            </Typography>
                                        </Box>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            className={classes.numberOfBounties}
                                        >
                                            <Typography variant="h5">
                                                {list.length}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails className={classes.details}>
                                    {list.map((bounty) => {
                                        return (
                                            <BountyCard
                                                key={uuid()}
                                                bounty={bounty}
                                            />
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
            <Box>
                <Box
                    className={classes.controls}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Paper component="form" className={classes.controlPaper}>
                        <IconButton
                            key={uuid()}
                            className={classes.iconButton}
                            onClick={() => refresh(true)}
                            disabled={state.loading}
                        >
                            <RefreshIcon />
                        </IconButton>
                        <Divider
                            className={classes.divider}
                            orientation="vertical"
                        />
                        <Select
                            value={state.loading ? '' : state.filter}
                            onChange={(e) => filter(e.target.value)}
                            disabled={state.loading}
                            className={classes.input}
                        >
                            {state.detailedMapLocationsActivities &&
                                filterOptions
                                    .filter((location) => {
                                        return (
                                            location === 'all' ||
                                            (state
                                                .detailedMapLocationsActivities[
                                                location
                                            ] &&
                                                Object.keys(
                                                    state
                                                        .detailedMapLocationsActivities[
                                                        location
                                                    ]
                                                ).length > 0)
                                        );
                                    })
                                    .sort()
                                    .map((location) => {
                                        return (
                                            <MenuItem
                                                key={uuid()}
                                                value={location}
                                            >
                                                {LOCALE[location]}
                                            </MenuItem>
                                        );
                                    })}
                        </Select>
                    </Paper>
                </Box>
                <Box
                    className={classes.listOuterContainer}
                    display="flex"
                    justifyContent="center"
                >
                    <Box className={classes.listInnerContainer}>
                        {jsxArray.filter((jsx) => jsx !== undefined).reverse()}
                    </Box>
                </Box>
            </Box>
            {state.loading && (
                <>
                    <LinearProgress
                        variant="determinate"
                        value={loadingProgress}
                    />
                    <Grid
                        container
                        spacing={0}
                        align="center"
                        justify="center"
                        direction="column"
                        className={classes.grid}
                    >
                        <Grid item>
                            <Typography variant="h5">Loading...</Typography>
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    );
};

ListView.propTypes = {
    logout: PropTypes.object,
    match: PropTypes.object,
    history: PropTypes.object,
};

export default withRouter(ListView);
