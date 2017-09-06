'use strict';

import React from 'react';
import ReactNative from 'react-native';
import JMessage from 'jmessage-react-plugin';

import FormButton from '../../../views/FormButton'

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Button,
    Alert,
    TextInput,
    FlatList,
    Image,
    Modal,
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
        width: 45,
        height: 45,
        marginRight: 10,
    },

    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 200,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    modalButton: {

    }
});

  var count = 0

  export default class ConversationList extends React.Component {
    static navigationOptions = {
        headerRight: <Button 
        title="创建会话" 
        onPress={
            ({state}) => {
                Alert.alert('state', JSON.stringify(state.params))

            }}
        />,
        title: "会话",
        tabBarLabel: '会话',
        tabBarIcon: ({ tintColor }) => (
          <Image
            source={require('../../../resource/chat-icon.png')}
            style={[styles.icon, {tintColor: tintColor}]}
          />
        ),
      };

    onCreateConversation() {
        // this.setState({isShowModal: true})
        Alert.alert("click","success")
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [{key:'a'}, {key:'b'}],
            modalText: "",
            isShowModal: false,
        }
        // this.onCreateConversation = this.onCreateConversation.bind(this)
        // this.props.navigation.setParams({ createConversastion: this.onCreateConversation });
    }

    componentDidMount() {
        this.props.navigation.setParams({ createConversastion: this.onCreateConversation });
        this.props.navigation.setParams({ test: 'test' });
      }
    componentWillMount() {
        JMessage.getConversations((result) => {   
            
            var data  = result.map((conversation, index) => 
                            {
                                var item = {}
                                item.key = index
                                item.conversation = conversation
                                if (conversation.conversationType === 'single') {
                                     item = {key: conversation.target.username}
                                     item.conversationType = 'single'
                                     item.displayName = conversation.target.nickname
                                } else {
                                    item = {key: conversation.target.id}
                                    item.conversationType = 'group'
                                    item.displayName = conversation.target.name
                                }

                                if (conversation.latestMessage === undefined) {
                                    item.latestMessageString = ""
                                    return item
                                }

                                item.conversationType = conversation.conversationType
                                if (conversation.latestMessage.type === 'text') {    
                                    item.latestMessageString = conversation.latestMessage.text 
                                }

                                if (conversation.latestMessage.type === 'image') {    
                                    item.latestMessageString = '[图片]' 
                                }

                                if (conversation.latestMessage.type === 'voice') {    
                                    item.latestMessageString = '[语言]' 
                                }

                                if (conversation.latestMessage.type === 'file') {    
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
        Alert.alert("click","fasdf")
        JMessage.createConversation({type: 'single', username: '0002'}, (conv) => {
            var item
            if (conv.conversationType === 'single') {
                 item = {key: conv.target.username}
                 item.conversationType = 'single'
            } else {
                item = {key: conv.target.id}
                item.conversationType = 'group'
                Alert.alert('conversaion', JSON.stringify(conv))
            }
            this.props.navigation.navigate('Chat', {conversation: item})
        }, (error) => {
            Alert.alert('error', JSON.stringify(error))
        })
    }

    render() {
        this.listView = <FlatList
        data = { this.state.data }
        renderItem = { ({item}) => (
            <View>
                <TouchableHighlight
                    style={[styles.conversationContent]}
                    underlayColor = '#dddddd'
                    onPress={ () => {
                            this.props.navigation.navigate('Chat', {conversation: item})
                        }}>
                    <View style={ [styles.conversationItem]}>
                        <Image 
                            source={require('../../../resource/group-icon.png')}
                            style={[styles.conversationAvatar]}>
                        </Image>
                        <View>
                            <Text>{ item.displayName }</Text>
                            <Text>{ item.latestMessageString }</Text>
                        </View>
                    </View>
                    
                    
                </TouchableHighlight>
                </View>
            ) }
        >
        
    </FlatList>
        return (

        <View>
            <Modal
                transparent={true}
                visible={ this.state.isShowModal }>
                <View
                    style={ styles.modalView }>
                    <View
                        style={ styles.modalContent}>
                        <TextInput
                            placeholder = "用户名或群聊名称"
                            onChangeText = { (e) => { this.setState({modalText: e}) } }>
                        </TextInput>
                        <Button
                            onPress={() => {
                                var params = {}
                                params.type = 'single'
                                params.username = this.state.modalText
                                JMessage.createConversation(params, (conv) => {
                                        var item = {}

                                        if (conv.conversationType === 'single') {
                                            item = {key: conv.target.username}
                                            item.conversationType = 'single'
                                        } else {
                                            item = {key: conv.target.id}
                                            item.conversationType = 'group'
                                            Alert.alert('conversaion', JSON.stringify(conv))
                                        }
                                        this.props.navigation.navigate('Chat', {conversation: item})
                                    }, (error) => {
                                        Alert.alert('error !', JSON.stringify(error))    
                                    })
                            } }
                            style={styles.modalButton}
                            title='创建单聊'>
                        </Button>
                        <Button
                            onPress={ () => {

                                JMessage.createGroup({name: this.state.modalText,desc: ""}, (group) => {
                                    var params = {}
                                    params.type = 'single'
                                    params.groupId = group.id
                                    JMessage.createConversation(params, (conv) => {
                                        var item = {}

                                        if (conv.conversationType === 'single') {
                                            item = {key: conv.target.username}
                                            item.conversationType = 'single'
                                        } else {
                                            item = {key: conv.target.id}
                                            item.conversationType = 'group'
                                            Alert.alert('conversaion', JSON.stringify(conv))
                                        }
                                    }, (error) => {
                                        Alert.alert('error !', JSON.stringify(error))    
                                    })
                                }, (error) => {
                                    Alert.alert('error !', JSON.stringify(error))
                                })
                                
                            } }
                            style={styles.modalButton}
                            title='创建群聊'>
                            
                        </Button>
                    </View>
                    
                </View>
            </Modal>
            { this.listView }
        </View>)
  }
}