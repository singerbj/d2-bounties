import React from "react";
import uuid from 'react-uuid';
import { Card, LinearProgress, Box, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import capitalize from "capitalize";

const useStyles = makeStyles((theme) => {
    return {
        box: {
            padding: theme.spacing(),
            margin: theme.spacing(1),
        },
        tag: {
            paddingRight: theme.spacing(),
            paddingLeft: theme.spacing(),
            marginTop: theme.spacing(),
            marginRight: theme.spacing(),
            marginBottom: theme.spacing(),
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            display: 'inline-flex'
        },
        title: {
            fontWeight: 'bold'
        }
    };
});

export const BountyCard = ({ bounty }) => {
    const classes = useStyles();
    const percentComplete = Math.round(bounty.overallProgress * 100 );
    return (
        <>
            <Divider />
            <Box className={classes.box}>
                {/* <img style={{ height: '50%', top: '25%', position: 'absolute', right: 0 }}src={'https://www.bungie.net' + bounty.icon} /> */}
                <Box>
                    <Typography className={classes.title} variant="subtitle1">{bounty.name}</Typography>
                    {/* ({bounty.itemType === 12 ? "Quest Step" : "Bounty"}) */}
                </Box>
                <Box>
                    <Typography variant="body2">{bounty.description}</Typography>
                </Box>
                <Box>
                    {bounty.relevantKeys.map((key) => {
                        return (
                            <Card key={uuid()} className={classes.tag} elevation={0}>
                                <Typography variant="overline">{capitalize.words(key.split('_').join(' '))}</Typography>
                            </Card>
                        );
                    })}
                </Box>
                <Box display="flex" alignItems="center">
                <Box width="100%" mr={1}>
                    <LinearProgress variant="determinate" value={percentComplete} />
                </Box>
                <Box minWidth={100}>
                    <Typography variant="body2" color="textSecondary">{`${percentComplete}% Completed`}</Typography>
                </Box>
                </Box>
            </Box>
        </>
    );
}