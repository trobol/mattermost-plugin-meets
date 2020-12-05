// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

import { PostTypes } from 'mattermost-redux/action_types';

import Client from '../client';

const BASE_URL = "http://g.co/meet/";

export function startMeeting(channelId, force = false) {
    return async (dispatch, getState) => {
        const meetingURL = `${BASE_URL}${channelId}`;
        Client.startMeeting(channelId, false, force);
        window.open(meetingURL);

        return { data: true };
    };
}
