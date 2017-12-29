'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';
import {
	TabNavigator
} from 'react-navigation';


const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Button,
    Alert,
    TextInput,
    Image,
    FlatList,
    ScrollView,
  } = ReactNative;



export default class ConversationDetail extends React.Component {
    static navigationOptions = {
      title: "会话详情",
    };

    static navigationOptions = ({
      navigation
    }) => {
        const {
            params = {}
        } = navigation.state;
        return {
            headerLeft: <Button title="返回" onPress={() => { 
              // this.props.navigation.goBack()
              navigation.goBack()
              // this.props.navigation.goBack() 
              // this.onGoBack()
              // Alert.alert("navigation", this.)
              setTimeout(() => {
                params.onGoBack()
              }, 100); 
              
              // Alert.alert("goback",par)
            }} />,
            title: "会话详情",
    
        }
    };

    constructor(props) {
      super(props)
      this.state = {
        data: [],
      } 
      // this.props.navigation.state.params.onGoBack();
      // Alert.alert("navigation", JSON.stringify(this.props.navigation.state.params.onGoBack))
    }

    componentWillMount() {
    }

    
    render() {

      return (
        <ScrollView>
            
        </ScrollView>
      );
    }
}