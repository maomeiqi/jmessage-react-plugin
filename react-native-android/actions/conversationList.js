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