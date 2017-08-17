'use strict';

import React from 'react';
import ReactNative from 'react-native';

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
  } = ReactNative;

  export default class MainActivity extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <Text >
            Get Platform List
        </Text> )
    }
  }