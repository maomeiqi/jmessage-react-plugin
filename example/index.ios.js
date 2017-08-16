/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React from 'react';
import {
	AppRegistry,
} from 'react-native';
import {
	StackNavigator
} from 'react-navigation';

import HomePage from './app/routes/Home/index.js';


const ReactJChat = StackNavigator({
	Home: {
		screen: HomePage
	},
});


AppRegistry.registerComponent('ReactJChat', () => ReactJChat);
