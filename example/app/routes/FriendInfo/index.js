'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';
import {
	TabNavigator
} from 'react-navigation';

import ListItem from '../../views/ListItem'

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
    }
});

export default class MyNotificationsScreen extends React.Component {
    static navigationOptions = {
      title: "好友详情",
    };
    constructor(props) {
      super(props)
      this.state = {
        userInfo: this.props.navigation.state.params.user
      }  
    }

    render() {
      if (this.state.userInfo.avatarThumbPath === "") {
        this.avatar = <Image
          source={require('../../resource/group-icon.png')}
          style={styles.avatar}>
        </Image>
      } else {
        this.avatar = <Image
        source={{isStatic:true,uri:this.state.userInfo.avatarThumbPath, scale:1}}
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
              { this.state.userInfo.nickname}
            </Text>
          </View>
          <ListItem
            title="username"
            content={this.state.userInfo.username}
            source={require('../../resource/myinfo-icon.png')}
          />
          <ListItem
            title="昵称"
            content={this.state.userInfo.nickname}
            source={require('../../resource/myinfo-icon.png')}
          />
          <ListItem
            title="性别"
            content={this.state.userInfo.gender}
            source={require('../../resource/myinfo-icon.png')}
          />
          <ListItem
            title="地区"
            content={this.state.userInfo.region}
            source={require('../../resource/myinfo-icon.png')}
          />
          <ListItem
            title="个性签名"
            content={this.state.userInfo.signature}
            source={require('../../resource/myinfo-icon.png')}
          />

          <Button
              title='发送消息'
              onPress= { () => {
                var item = {key: this.state.userInfo.username}
                item.conversationType = 'single'
                this.props.navigation.navigate('Chat', {conversation: item})
              }}
          />

        </View>
      );
    }
}