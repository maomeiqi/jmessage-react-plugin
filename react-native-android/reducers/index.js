'use strict';

import { combineReducers } from 'redux';
import conversationReducer from './conversationReducer';
import messageReducer from './messageReducer';

const rootReducer = combineReducers({
	conversationReducer,
	messageReducer,
})
export default rootReducer;