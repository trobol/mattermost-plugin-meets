// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

import React from 'react';

import { Client4 } from 'mattermost-redux/client';
import { getConfig } from 'mattermost-redux/selectors/entities/general';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';
import { getUsers } from 'mattermost-redux/selectors/entities/common'
import { getUsersInVisibleDMs, makeGetProfilesInChannel } from 'mattermost-redux/selectors/entities/users';
import { General } from 'mattermost-redux/constants'

import { id as pluginId } from './manifest';

import Icon from './components/icon';


class Plugin {
    // eslint-disable-next-line no-unused-vars
    initialize(registry, store) {
        registry.registerChannelHeaderButtonAction(
            <Icon/>,
            (channel) => {
                const meeting_url = 'http://g.co/meet/';
                const state = store.getState();

                let meeting_name = '';
                if (channel.type == General.DM_CHANNEL || channel.type == General.GM_CHANNEL) {

                    const usernames = Object.values(getUsers(state)).map(u => u.username);
                    usernames.sort();
                    meeting_name = 'dm';
                    for (let u of usernames) {
                        meeting_name += '-' + u;
                    }

                } else {

                    const team = getCurrentTeam(state);
                    meeting_name =`${team.display_name}-${channel.display_name}`;
                }

                meeting_name = sanitizeMeetName(meeting_name);

                const url = meeting_url+meeting_name;
                console.log(meeting_name);
                window.open(url);
               
                doPost(`${this.url}/join`, { channel_id: channel.id });

            },
            'Join Meeting',
        );
        let state = store.getState();
        this.setServerRoute(state);
      
    }

    setServerRoute(state) {
        const config = getConfig(state);

        let basePath = '';
        if (config && config.SiteURL) {
            basePath = new URL(config.SiteURL).pathname;

            if (basePath && basePath[basePath.length - 1] === '/') {
                basePath = basePath.substr(0, basePath.length - 1);
            }
        }

        this.url = basePath + '/plugins/' + pluginId;
    }
}

function sanitizeMeetName(name) {
    name = name.replace(/ /g, '_');
    return name.replace(/[^a-zA-Z0-9-_]/g, ''); //remove invalid chars
} 

const doPost = async (url, body, headers = {}) => {
    const options = {
        method: 'post',
        body: JSON.stringify(body),
        headers,
    };

    const response = await fetch(url, Client4.getOptions(options));

    if (response.ok) {
        return response.json();
    }

    const text = await response.text();

    throw new ClientError(Client4.url, {
        message: text || '',
        status_code: response.status,
        url,
    });
};

window.registerPlugin(pluginId, new Plugin());