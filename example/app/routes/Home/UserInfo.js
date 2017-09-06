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

    }

    render() {
        return ( <Text >Home</Text> )
    }
  }