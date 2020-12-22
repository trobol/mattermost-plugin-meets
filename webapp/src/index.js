// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

import React from 'react';

import { Client4 } from 'mattermost-redux/client';
import { getConfig } from 'mattermost-redux/selectors/entities/general';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';
import { getUsersInVisibleDMs } from 'mattermost-redux/selectors/entities/users';
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
                const team = getCurrentTeam(state);
                
                let meeting_name = '';
                if (channel.type == General.DM_CHANNEL) {
                    const [profA, profB] = getUsersInVisibleDMs(state);
                    meeting_name = `${profA.username}-${profB.username}`;
                } else {
                    meeting_name = `${team.display_name}-${channel.display_name}`.replace(/ /g, '_');
                }
               
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



export const doPost = async (url, body, headers = {}) => {
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