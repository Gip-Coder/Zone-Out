import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook to manage authentication states and authorization scripts
 * for Spotify, Apple Music, and YouTube Music.
 */
export function useMusicAuth() {
    const [connections, setConnections] = useState({
        spotify: false,
        apple: false,
        youtube: false,
        amazon: false
    });

    const [tokens, setTokens] = useState({
        spotify: null,
        youtube: null
    });

    // Spotify Logic
    useEffect(() => {
        // Check hash for Spotify redirect token
        const hash = window.location.hash;
        let token = window.localStorage.getItem('spotify_token');

        if (!token && hash) {
            token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token'))?.split('=')[1];
            window.location.hash = ''; // Clear hash from URL securely
            if (token) {
                window.localStorage.setItem('spotify_token', token);
            }
        }

        if (token) {
            setConnections(prev => ({ ...prev, spotify: true }));
            setTokens(prev => ({ ...prev, spotify: token }));
        }
    }, []);

    const loginSpotify = () => {
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        if (!clientId || clientId === "YOUR_SPOTIFY_CLIENT_ID") {
            throw new Error("Spotify Client ID is missing in .env");
        }
        const redirectUri = window.location.origin; // Usually needs to be exact match in Spotify Dashboard
        const scopes = ['playlist-read-private', 'playlist-read-collaborative'];

        window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
    };

    const logoutSpotify = () => {
        window.localStorage.removeItem('spotify_token');
        setConnections(prev => ({ ...prev, spotify: false }));
        setTokens(prev => ({ ...prev, spotify: null }));
    };

    // YouTube / Google Auth Logic
    const loginYouTube = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
            throw new Error("Google Client ID is missing in .env");
        }

        // Dynamic import of Google Identity Services to keep bundle small
        if (window.google?.accounts?.oauth2) {
            initiateGoogleFlow(clientId);
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => initiateGoogleFlow(clientId);
            document.body.appendChild(script);
        }
    };

    const initiateGoogleFlow = (clientId) => {
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/youtube.readonly',
            callback: (response) => {
                if (response.access_token) {
                    window.localStorage.setItem('youtube_token', response.access_token);
                    setConnections(prev => ({ ...prev, youtube: true }));
                    setTokens(prev => ({ ...prev, youtube: response.access_token }));
                }
            },
        });
        client.requestAccessToken();
    };

    // Apple Music Logic
    const loginAppleMusic = async () => {
        const devToken = import.meta.env.VITE_APPLE_MUSIC_DEV_TOKEN;
        if (!devToken || devToken === "YOUR_APPLE_MUSIC_DEV_TOKEN") {
            throw new Error("Apple Music Developer Token is missing in .env");
        }

        const initAppleMusic = async () => {
            try {
                await window.MusicKit.configure({
                    developerToken: devToken,
                    app: {
                        name: 'ZoneOut',
                        build: '1.0.0'
                    }
                });
                const music = window.MusicKit.getInstance();
                await music.authorize();
                setConnections(prev => ({ ...prev, apple: true }));
            } catch (err) {
                throw new Error(`Apple Music authorization failed: ${err.message}`);
            }
        };

        if (window.MusicKit) {
            await initAppleMusic();
        } else {
            const script = document.createElement('script');
            script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
            script.async = true;
            script.onload = initAppleMusic;
            document.body.appendChild(script);
        }
    };


    return {
        connections,
        tokens,
        loginSpotify,
        logoutSpotify,
        loginYouTube,
        loginAppleMusic
    };
}
