'use strict';

import React from 'react-native';
import * as types from './ActionTypes';
var {
	NativeModules,
} = React;

var MessageController = NativeModules.MessageController;

export function updateGroupTitle(groupId) {
	return dispatch => {
		MessageController.getGroupMemberSize(groupId, (num) => {
			console.log('num: ' + num);
			dispatch ({
				type: types.BEFORE_UPDATE_INFO,
				number: num,
			})
		});
	}
}

export function getMessages(username, groupId, appKey) {
	return dispatch => {
		type: types.INITIAL_MESSAGE_LIST,
		MessageController.getMessages(username, groupId, appKey, (result) => {
			dispatch ({
				type: types.LOAD_MESSAGES,
				msgList: JSON.parse(result),
			});
		});
	}
}