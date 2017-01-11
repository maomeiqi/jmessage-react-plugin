'use strict';

import React from 'react';
import {
	AppRegistry
} from 'react-native';
import ReactJChat from './react-native-android/containers/ReactJChat';
var MyAwesomeApp = React.createClass({

	render() {
		return (
			<ReactJChat />
		);
	}
});


AppRegistry.registerComponent('JChatApp', () => MyAwesomeApp);