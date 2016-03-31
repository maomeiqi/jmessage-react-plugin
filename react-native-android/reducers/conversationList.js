'use strict';

import React from 'react-native';
import * as types from '../actions/ActionTypes';
import { combineReducers } from 'redux';
var {
	ListView,
	NativeModules,
} = React;
var JMessageHelper = NativeModules.JMessageHelper;

export default function conversationList(state, action) {
	state = state || {
		type: types.INITIAL_CONVERSATION_LIST,
		convList: [],
		dataSource: [],
		fetching: true,
	}

	switch(action.type) {
		case types.LOAD_CONVERSATIONS:
			var dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
			var convList = action.convList;
			dataSource = dataSource.cloneWithRows(convList);
			return {
				...state,
				...action,
				convList,
				dataSource,
				fetching: false
			}
		case types.LOAD_ERROR:
			var dataSource = action.convList;
			return {
				...state,
				...action,
				dataSource,
				fetching: false
			}
		case types.ADDING_FRIEND:
			return {
				...state,
				...action,
				fetching: true
			}
			break;
		case types.ADD_FRIEND_SUCCESS:
			var convList = [...state.convList];
			convList.unshift(action.conversation);
			dataSource = state.dataSource.cloneWithRows(convList);
			return {
				...state,
				...action,
				convList,
				dataSource,
				fetching: false
			}
		case types.DELETE_CONVERSATION:
			var selected = action.selected;
			var convList = [...state.convList];
			var index = convList.indexOf(selected);
			convList = convList.splice(index, 1);
			dataSource = state.dataSource.cloneWithRows(convList);
			return {
				...state,
				...action,
				convList,
				dataSource
			}
		default:
			return {
				...state
			}
	}
}