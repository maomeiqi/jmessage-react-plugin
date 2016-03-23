'use strict';

import { combineReducers } from 'redux';
import conversationList from './conversationList';

const rootReducer = combineReducers({
	conversationList,
})
export default rootReducer;