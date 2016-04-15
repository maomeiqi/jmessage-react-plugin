'use strict';

import React from 'react-native';
import * as types from '../actions/ActionTypes';

var {
	ListView,
	NativeModules,
} = React;

export default function messageList(state, action) {
	state = state || {
		type: types.INITIAL_MESSAGE_LIST,
		dataSource: [],
		fetching: true,
	}

	switch(action.type) {
		case types.BEFORE_UPDATE_INFO:
			return {
				...state,
				...action,
				number: action.number,
			}
		case types.AFTER_UPDATE_INFO:
			return {
				...state,
				...action,
				title: action.title,
				number: action.number,
			}
		case types.LOAD_MESSAGES:
			var dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
			var msgList = action.msgList;
			dataSource = dataSource.cloneWithRows(msgList);
			return {
				...state,
				...action,
				msgList: msgList,
				dataSource,
				fetching: false,
			}
		default:
			return {
				...state,
			}
	}
}