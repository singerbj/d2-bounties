import React, { useState, useEffect } from "react";
import axios from 'axios';
import { DEFAULT_STATE, BUNGIE_APP_ID, API_KEY, TOKEN_URL, AUTHORIZE_URL, LOCATIONS, ACTIVITIES, WEAPONS, ELEMENTS, ENEMIES, ALL_KEYS } from './Constants';
import ListView from './ListView';
import {
    BrowserRouter,
    Route,
    Redirect
} from "react-router-dom";
import { Button, LinearProgress } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const createFormParams = (params) => {
    return Object.keys(params)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
};

const getToken = async () => {
    return await axios({
        url: TOKEN_URL,
        method: 'post',
        headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: createFormParams({
            grant_type: 'authorization_code',
            client_id: BUNGIE_APP_ID,
            code: localStorage.getItem('code')
        })
    })
};

const urlParams = new URLSearchParams(window.location.search);
let code = localStorage.getItem('code');
if(!code){
    code = urlParams.get('code');
};
if(window.location.search !== ""){
    window.history.pushState('d2-bounties', 'd2-bounties', window.location.origin + window.location.pathname);
}

const App = () => {
    const [ state, setState ] = useState({ ...DEFAULT_STATE, loggedIn: false });

    const theme = React.useMemo(() => {
        return createMuiTheme({
            palette: {
                type: 'dark',
            },
        });
    }, []);

    const login = () => { 
        window.location = AUTHORIZE_URL;
    };

    const logout = () => {
        localStorage.removeItem('code');
        localStorage.removeItem('access_token');
        setState({
            ...state,
            loggedIn: false,
            loading: false
        });
    };

    useEffect(() => {
        if(!code) {
            setState({
                ...state,
                loading: false
            });
        } else {
            localStorage.setItem('code', code);
            
            (async () => {
                try {
                    if(!localStorage.getItem('access_token')){
                        const { data } = await getToken();
                        localStorage.setItem('access_token', JSON.stringify({ ...data }));
                    }
                    setState({
                        ...state,
                        loading: false,
                        loggedIn: true
                    });
                } catch (e) {
                    console.dir(e);
                    localStorage.removeItem('code');
                    localStorage.removeItem('access_token');
                    setState({
                        ...state,
                        loading: false
                    });
                    return;
                }
            })();
        }
    }, []);

    let jsx;
    if(state.loading){
        jsx = <LinearProgress variant="determinate" value={10}/>;
    } else {
        if (state.loggedIn) {
            jsx = <ListView logout={logout}></ListView>;
        } else {
            jsx = <Button color="primary" variant="contained" onClick={() => login()}>Please Log In</Button>;
        }
    }  

    console.log((window.location.pathname !== '/' ? window.location.pathname : ''));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter basename={(window.location.pathname !== '/' ? window.location.pathname : '') + "#"}>
                <Route exact path="/filter/:filter">
                    {jsx}
                </Route>
                <Redirect to='/filter/all' />
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;