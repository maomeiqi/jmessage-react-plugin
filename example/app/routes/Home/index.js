'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';
import {
	TabNavigator
} from 'react-navigation';

import ConversationList from './ConversationList/index.js'
import UserInfo from './UserInfo/index.js'

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Button,
    Alert,
    TextInput,
    Image
  } = ReactNative;
  
  const HomePage = TabNavigator({
    Conversation: {
      screen: ConversationList,
    },
    UserInfo: {
      screen: UserInfo,
    },
  }, {
    tabBarOptions: {
      activeTintColor: '#e91e63',
    },
  });
  module.exports = HomePage
  