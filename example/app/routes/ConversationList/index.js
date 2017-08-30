'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';

import FormButton from '../../views/FormButton'

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Button,
    Alert,
    TextInput,
    FlatList,
  } = ReactNative;

  class MyListItem extends React.PureComponent {
    _onPress = () => {
      this.props.onPressItem(this.props.id);
    };
  
    render() {
      return (
          <View>
            <SomeOtherWidget
                {...this.props}
                onPress={this._onPress}
            />
          </View>)
    }
  }

  
var count = 0
  export default class ConversationList extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            data: [{key:'a'}, {key:'b'}]
        }
        this._onPress = this._onPress.bind(this)
    }

    componentWillMount() {
        JMessage.getConversations((result) => {   
            
            var data  = result.map((conversaion) => 
                            {
                                var item
                                if (conversaion.conversationType === 'single') {
                                     item = {key: conversaion.target.username}
                                } else {
                                    item = {key: conversaion.target.id}
                                    Alert.alert('conversaion', JSON.stringify(conversaion))
                                }

                                item.conversationType = conversaion.conversationType
                                if (conversaion.latestMessage.type === 'text') {    
                                    item.latestMessageString = conversaion.latestMessage.text 
                                }

                                if (conversaion.latestMessage.type === 'image') {    
                                    item.latestMessageString = '[图片]' 
                                }

                                if (conversaion.latestMessage.type === 'voice') {    
                                    item.latestMessageString = '[语言]' 
                                }

                                if (conversaion.latestMessage.type === 'file') {    
                                    item.latestMessageString = '[文件]' 
                                }

                                return item
                            })
            this.setState({data: data})
        }, (error) => {
            Alert.alert(JSON.stringify(error))
        })    
    }

    _onPress() {
    }

    render() {
        this.listView = <FlatList
        data = { this.state.data }
        renderItem = { ({item}) => (
            <View>
                <TouchableHighlight
                    onPress={ () => {
                            this.props.navigation.navigate('Chat', {conversation: item})
                        }}>
                    <Text>{item.key}</Text>
                    
                </TouchableHighlight>
                </View>
            ) }
        >
        
    </FlatList>
        return (
        <View>
            <Button
            title = "Add"
            onPress={this._onPress}>

            </Button>
            { this.listView }
        </View>)
  }
}