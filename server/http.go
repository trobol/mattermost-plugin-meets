// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License for license information.

package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/mattermost/mattermost-server/v5/model"
	"github.com/mattermost/mattermost-server/v5/plugin"
)

type joinMeetingMessage struct {
	ChannelID string `json:"channel_id"`
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	config := p.getConfiguration()
	if err := config.IsValid(); err != nil {
		http.Error(w, "This plugin is not configured.", http.StatusNotImplemented)
		return
	}

	switch path := r.URL.Path; path {
	case "/join":
		p.handleJoin(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (p *Plugin) handleJoin(w http.ResponseWriter, r *http.Request) {

	userID := r.Header.Get("Mattermost-User-ID")
	if userID == "" {
		http.Error(w, "Not authorized", http.StatusUnauthorized)
		return
	}
	var err error
	var req joinMeetingMessage
	if err = json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	user, appErr := p.API.GetUser(userID)
	if appErr != nil {
		http.Error(w, appErr.Error(), appErr.StatusCode)
		return
	}
	if _, appErr = p.API.GetChannelMember(req.ChannelID, userID); appErr != nil {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	_ = p.postJoinMessage(user, 0, req.ChannelID, "")

	_, err = w.Write([]byte(`{"meeting_url": ""}`))
}

func (p *Plugin) postJoinMessage(user *model.User, meetingID int, channelID string, topic string) error {

	post := &model.Post{
		UserId:    p.botUserID,
		ChannelId: channelID,
		Message:   fmt.Sprintf("%s joined the meeting", user.Username),
	}

	_, appErr := p.API.CreatePost(post)
	if appErr != nil {
		return appErr
	}

	return nil
}
