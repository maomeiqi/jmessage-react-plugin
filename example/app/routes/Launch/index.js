'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';
import Translations from '../../resource/Translations'

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Alert,
  } = ReactNative;

  export default class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { navigate } = this.props.navigation;
        var params = {
              'appkey': "4f7aef34fb361292c566a1cd",
              'isOpenMessageRoaming': false,
              'isProduction': false,
              'channel': ""
             }
        JMessage.init(params)
        JMessage.getMyInfo((myInfo) => {
            if (myInfo.username) {
                // navigate('Home')
                navigate('ConversationList')
            } else {
                navigate('Login')
                // navigate('Chat')
            }
        })

      }

    render() {
        return ( <View ></View> )
    }
  }