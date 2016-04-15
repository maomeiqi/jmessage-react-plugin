'use strict';

import React from 'react-native';
import * as types from '../actions/ActionTypes';
import { combineReducers } from 'redux';
import Immutable from 'immutable';
var {
	ListView,
	NativeModules,
} = React;
var JMessageHelper = NativeModules.JMessageHelper;


export default function conversationList(state, action) {
	state = state || {
		type: types.INITIAL_CONVERSATION_LIST,
		dataSource: [],
		fetching: true,
		adding: true,
		error: false,
	}

	switch(action.type) {
		case types.LOAD_CONVERSATIONS:
			var dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
			var convList = action.convList;
			dataSource = dataSource.cloneWithRows(convList);
			return {
				...state,
				...action,
				convList: convList,
				dataSource,
				fetching: false,
			}
		case types.LOAD_ERROR:
			var dataSource = action.convList;
			return {
				...state,
				...action,
				dataSource,
			}
		case types.ADDING_FRIEND:
			return {
				...state,
				...action,
				adding: true
			}
			break;
		case types.ADD_FRIEND_SUCCESS:
			var convList = [...state.convList];
			convList.unshift(action.conversation);
			dataSource = state.dataSource.cloneWithRows(convList);
			return {
				...state,
				...action,
				convList: convList,
				dataSource,
				adding: false
			}
		case types.DELETE_CONVERSATION:
			var selected = action.selected;
			var convList = [...state.convList];
			convList.splice(selected, 1);
			var newList = new Array();
			newList = convList;
			dataSource = state.dataSource.cloneWithRows(newList);
			return {
				...state,
				...action,
				convList: newList,
				dataSource
			}
		case types.CREATE_GROUP_SUCCESS:
			var convList = [...state.convList];
			convList.unshift(action.conversation);
			dataSource = state.dataSource.cloneWithRows(convList);
			return {
				...state,
				...action,
				convList: convList,
				dataSource,
				createGroup: true,
			}
		default:
			return {
				...state
			}
	}
}