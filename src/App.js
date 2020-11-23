import React, { useState, useEffect } from "react";
import axios from 'axios';
import uuid from 'react-uuid';
import { DEFAULT_STATE, BUNGIE_APP_ID, API_KEY, TOKEN_URL, AUTHORIZE_URL, LOCATIONS, ACTIVITIES, WEAPONS, ELEMENTS, ENEMIES, ALL_KEYS } from './Constants';
import ListView from './ListView';

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

const App = () => {
    const [ state, setState ] = useState({ ...DEFAULT_STATE, loggedIn: false });

    const login = () => { 
        // if(!localStorage.getItem('code') && !localStorage.getItem('access_token')){
            window.location = AUTHORIZE_URL;
        // }
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
        const urlParams = new URLSearchParams(window.location.search);
        let code = localStorage.getItem('code');
        if(!code){
            code = urlParams.get('code');
        };

        if(!code) {
            setState({
                ...state,
                loading: false
            });
        } else {
            localStorage.setItem('code', code);
            if(window.location.search !== ""){
                // window.location = window.location.origin;
                window.history.pushState('d2-bounties', 'd2-bounties', window.location.origin);
            }
            
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

    if(state.loading ){
        return <div>App Loading...</div>;
    } else {
        if (state.loggedIn) {
            return <ListView logout={logout}></ListView>;
        } else {
            return <button onClick={() => { login(); }}>Please Log In</button>
        }
    }
};

export default App;