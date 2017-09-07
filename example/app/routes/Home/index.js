'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';
import {
	TabNavigator
} from 'react-navigation';

import ConversationList from './ConversationList/index.js'
import MyInfo from './MyInfo/index.js'
import FriendList from './Friends/index.js'

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
    Friend: {
      screen: FriendList,
    },
    MyInfo: {
      screen: MyInfo,
    },
  }, {
    tabBarOptions: {
      activeTintColor: '#e91e63',
    },
  });
  module.exports = HomePage
  