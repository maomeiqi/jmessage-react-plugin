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
    Image
  } = ReactNative;

  const styles = StyleSheet.create({
    header: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      borderBottomWidth: 1,
      borderColor: "#cccccc",
    },
    icon: {
        width: 26,
        height: 26,
    },
    username: {
      marginTop: 10,
      marginBottom: 20,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',

    },
    listContent: {
      borderBottomWidth: 1,
      borderColor: "#cccccc",
    },
    listItem: {
      flexDirection:'row',
      alignItems: 'center',
      margin: 10,
    },
    itemIcon: {
      width: 26,
      height: 26,
      marginRight: 10,
    },
});

export default class MyNotificationsScreen extends React.Component {
    static navigationOptions = {
      title: "我",
      tabBarLabel: '我',
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={require('../../../resource/user-icon.png')}
          style={[styles.icon, {tintColor: tintColor}]}
        />
      ),
    };
    constructor(props) {
      super(props)
      this.state = {
        myInfo: {}
      }
    }
    componentWillMount() {
      JMessage.getMyInfo((user) => {
        // this.sta = myInfo
        this.setState({myInfo: user})
      })
    }
    render() {
      return (
        <View>
          <View
            style={[styles.header]}>
            <Image
              source={require('../../../resource/group-icon.png')}
              style={[styles.header]}>
            </Image>
            <Text
              style={[styles.username]}>
              { this.state.myInfo.nickname}
            </Text>
          </View>
          <TouchableHighlight
            underlayColor = '#dddddd'
            style={[styles.listContent]}
            onPress={ () => {
            }}
            >
            <View
              style={[styles.listItem]}>
              <Image
                source={require('../../../resource/myinfo-icon.png')}
                style={[styles.itemIcon]}>
              </Image>              
              <Text>{this.state.myInfo.username}</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor = '#dddddd'
            style={[styles.listContent]}
            onPress={ () => {
            }}
          >
            <View
              style={[styles.listItem]}>
              <Image
                source={require('../../../resource/setting-icon.png')}
                style={[styles.itemIcon]}>
              </Image>              
              <Text>{ "设置" }</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.listContent]}
            underlayColor = '#dddddd'
            onPress={() => {
              JMessage.logout()
              this.props.navigation.navigate('Login')
            }}>
            <View
              style={[styles.listItem]}>
              <Image
                source={require('../../../resource/logout-icon.png')}
                style={[styles.itemIcon]}>
              </Image>              
              <Text>{ "登出" }</Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    }
}