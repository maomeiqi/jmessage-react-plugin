'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';
import {
	TabNavigator
} from 'react-navigation';

import ListItem from '../../../views/ListItem'

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Button,
    Alert,
    TextInput,
    Image,
  } = ReactNative;

const styles = StyleSheet.create({
    header: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      borderBottomWidth: 1,
      borderColor: "#cccccc",
    },
    avatar: {
      width: 60,
      height: 60,
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
        this.setState({myInfo: user})
      })
      
    }
    render() {
      if (this.state.myInfo.avatarThumbPath === "") {
        this.avatar = <Image
          source={require('../../../resource/group-icon.png')}
          style={styles.avatar}>
        </Image>
      } else {
        this.avatar = <Image
        source={{isStatic:true,uri:this.state.myInfo.avatarThumbPath, scale:1}}
        style={styles.avatar}>
      </Image>
      }
      return (
        <View>
          <View
            style={[styles.header]}>
            { this.avatar }
            <Text
              style={[styles.username]}>
              { this.state.myInfo.nickname}
            </Text>
          </View>
          <ListItem
            title={this.state.myInfo.username}
            source={require('../../../resource/myinfo-icon.png')}
            onPress={ () => {
                this.props.navigation.navigate('UpdataMyInfo')
              }}
          />
          
          <ListItem
            title="设置"
            source={require('../../../resource/setting-icon.png')}
            onPress={ () => {
              }}
          />

          <ListItem
            title="登出"
            source={require('../../../resource/logout-icon.png')}
            onPress={ () => {
                JMessage.logout()
                this.props.navigation.navigate('Login')
              }}
          />

        </View>
      );
    }
}