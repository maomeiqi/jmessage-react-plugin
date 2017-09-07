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
    FlatList,
    ScrollView,
  } = ReactNative;

  const styles = StyleSheet.create({
    icon: {
        width: 26,
        height: 26,
    },
    conversationContent: {
        borderBottomWidth: 1,
        borderColor: "#cccccc",
        height: 60,
    },
    conversationItem: {
        flexDirection:'row',
        margin: 10,
        alignItems: 'center',
    },
    conversationAvatar: {
        width: 26,
        height: 26,
        marginRight: 10,
    },
});

export default class MyNotificationsScreen extends React.Component {
    static navigationOptions = {
      title: "好友",
      tabBarLabel: '好友',
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={require('../../../resource/friend-icon.png')}
          style={[styles.icon, {tintColor: tintColor}]}
        />
      ),
    };
    constructor(props) {
      super(props)
      this.state = {
        data: [],
      }
      this.reloadFriendList = this.reloadFriendList.bind(this)
    }
    
    componentWillMount() {
        this.reloadFriendList()
    }

    reloadFriendList() {
        JMessage.getFriends((result) => {
            var friendArr = result.map((friend, index) => {
                var element = {}
                element.key = index
                element.userInfo = friend
                return element
            })
            this.setState( {data: friendArr} )
        }, (error) => {
            Alert.alert('error', JSON.stringify(error))
        })
    }
    
    render() {
        var friendList = <FlatList
        style={{borderTopWidth:15, borderTopColor:'#ddd'}}
        data = { this.state.data }
        renderItem = { ({item}) => (
            <View>
                <TouchableHighlight
                    style={[styles.conversationContent]}
                    underlayColor = '#dddddd'
                    onPress={ () => {
                            {/* this.props.navigation.navigate('Chat', {conversation: item}) */}
                            this.props.navigation.navigate('FriendInfo', {user: item.userInfo})
                        }}>
                    <View style={ [styles.conversationItem]}>
                        <Image 
                            source={require('../../../resource/group-icon.png')}
                            style={[styles.conversationAvatar]}>
                        </Image>
                        <View>
                            <Text>{ item.userInfo.username }</Text>
                        </View>
                    </View>
                </TouchableHighlight>
                </View>
            ) }
        >
        
    </FlatList>

      return (
        <ScrollView>
            <ListItem
                title="验证消息"
                source={require('../../../resource/alert-icon.png')}
                onPress={ () => {

                } }/>
            <ListItem
                title="群组"
                source={require('../../../resource/group-icon.png')}
                onPress={ () => {
                    this.props.navigation.navigate('Groups')
                } }/>
            { friendList }
        </ScrollView>
      );
    }
}