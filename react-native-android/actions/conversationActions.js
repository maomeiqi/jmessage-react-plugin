'use strict';

import React from 'react-native';
import * as types from './ActionTypes';
var {
	NativeModules,
} = React;
var JMessageHelper = NativeModules.JMessageHelper;

export function loadConversations() {
	return dispatch => {
		type: types.INITIAL_CONVERSATION_LIST,
		JMessageHelper.getConvList((result) => {
			dispatch({
				type: types.LOAD_CONVERSATIONS,
				convList: JSON.parse(result),
			});
		}, () => {
			dispatch({
				type: types.LOAD_ERROR,
				convList: []
			})
		});
	}
}

export function addFriend(username) {
	return dispatch => {
		type: types.ADDING_FRIEND,
		JMessageHelper.addFriend(username, (result) => {
			dispatch ({
				type: types.ADD_FRIEND_SUCCESS,
				conversation: JSON.parse(result)
			});
		})
	}
}

export function deleteConversation(conversation: Object, selected: number) {
	return dispatch => {
		JMessageHelper.deleteConversation(conversation.username, conversation.groupId, conversation.appKey, () => {
			dispatch ({
				type: types.DELETE_CONVERSATION,
				selected: selected,
				conversation: conversation
			});
		})
	}
}

export function createGroup() {
	return dispatch => {
		JMessageHelper.createGroup((result) => {
			dispatch ({
				type: types.CREATE_GROUP_SUCCESS,
				conversation: JSON.parse(result)
			});
		});
	}
}