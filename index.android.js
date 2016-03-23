'use strict';

import React from 'react-native';
import ReactJChat from './react-native-android/containers/ReactJChat';
var MyAwesomeApp = React.createClass({
  
    render() {
      return (
        <ReactJChat />
      );
    }
});


React.AppRegistry.registerComponent('JChatApp', () => MyAwesomeApp);


