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

export default class Groups extends React.Component {
    static navigationOptions = {
      title: "群组",
    };

    constructor(props) {
      super(props)
      this.state = {
        data: [],
      }
      this.reloaGroupList = this.reloaGroupList.bind(this)
    }
    
    componentWillMount() {
        this.reloaGroupList()
    }

    reloaGroupList() {
        JMessage.getGroupIds((result) => {
            var groupIdArr = result.map((groupId) => {
                var element = {}
                element.key = groupId
                return element
            })
            this.setState( {data: groupIdArr} )
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
                <ListItem
                    title={"" + item.key}
                    source={require('../../resource/group-icon.png')}
                    onPress={ () => {
                        JMessage.getGroupInfo({id: item.key}, (group) => {
                            var item = {}

                            item = {key: group.id}
                            item.conversationType = 'group'
                            
                            this.props.navigation.navigate('Chat', {conversation: item})
                        }, (error) => {
                            Alert.alert('error', JSON.stringify(error))
                        })
                    } }
                />
            </View>
            ) }
        >
        
    </FlatList>

      return (
        <ScrollView>
            { friendList }
        </ScrollView>
      );
    }
}