'use strict';

import React from 'react';
import ReactNative, { ScrollView } from 'react-native';
import JMessage from 'jmessage-react-plugin';
import {observer} from 'mobx-react/native';
import {observable} from 'mobx';

import FormButton from '../../../views/FormButton';
import ConversationListStore from './ConversationListStore';

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
        flexDirection: 'row',
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
        width: 300,
        height: 300,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    modalButton: {
        margin: 10,
    },
    inputStyle: {
        width: 200
    }
});

var count = 0

@observer
export default class ConversationList extends React.Component {
    static navigationOptions = ({
        navigation
    }) => {
        const {
            params = {}
        } = navigation.state;
        return {
            headerRight: <Button title="创建会话" onPress={() => { params.createConversation() }} />,
            title: "会话",
            tabBarLabel: '会话',
            tabBarIcon: ({
                tintColor
            }) => (
                    <Image
                        source={require('../../../resource/chat-icon.png')}
                        style={[styles.icon, { tintColor: tintColor }]}
                    />
                ),
        }
    };

    _onCreateConversation() {
        this.setState({
            isShowModal: true
        })
    }

    constructor(props) {
        super(props);
        this.ConversationListStore = ConversationListStore
        this.state = {
            data: [{
                key: 'a'
            }, {
                key: 'b'
            }],
            modalText: "",
            isShowModal: false,
            refresh: (new Map(): Map<string, boolean>)
        }
        this._onCreateConversation = this._onCreateConversation.bind(this)
    }

    componentDidMount() {
        this.props.navigation.setParams({
            createConversation: this._onCreateConversation
        });
        JMessage.setDebugMode({
            enable: true
        });
        JMessage.addReceiveMessageListener((message) => {
            this.reloadConversationList()
        })
    }

    componentWillMount() {
        this.reloadConversationList()
    }

    reloadConversationList() {
        JMessage.getConversations((result) => {
            this.ConversationListStore.convertToConvList(result)
        }, (error) => {
            Alert.alert(JSON.stringify(error))
        })
    }

    enterConversation(conv) {
        this.reloadConversationList()
        JMessage.enterConversation(conv, (status) => { }, (error) => { })
        this.props.navigation.navigate('Chat', {
            conversation: {type: conv.conversationType, username: conv.target.username, groupId: conv.groupId}
        })
    }

    createConversation(params) {
        JMessage.createConversation(params, (conv) => {
            this.enterConversation(conv)
        }, (error) => {
            Alert.alert('create conversation error !', JSON.stringify(error))
        })
    }

    enterChatRoom(item) {
        JMessage.enterChatRoom(item, (conversation) => {
            this.props.navigation.navigate('Chat', {
                conversation: {type: conversation.conversationType, roomId: conversation.target.roomId}
            })
        }, (error) => {
            console.alert("error, code: " + error.code + ", description: " + error.description)
        })
    }

    render() {
        this.listView = <FlatList
            data={this.ConversationListStore.convList}
            extraData={this.state}
            renderItem={
                ({
                    item
                }) => (
                        <View>
                            <TouchableHighlight
                                style={[styles.conversationContent]}
                                underlayColor='#dddddd'
                                onPress={() => {
                                    if (item.type === "chatroom") {
                                        this.enterChatRoom(item)
                                    } else {
                                        this.enterConversation(item.conversation)
                                    }
                                }}>
                                <View style={[styles.conversationItem]}>
                                    <Image
                                        source={{uri: item.avatarThumbPath}}
                                        style={[styles.conversationAvatar]}>
                                    </Image>
                                    <View>
                                        <Text>{item.displayName}</Text>
                                        <Text>{item.latestMessageString}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    )
            } >

        </FlatList>
        return (

            <View>
                <Modal
                    transparent={true}
                    visible={this.state.isShowModal}>
                    <View
                        style={styles.modalView}>
                        <View
                            style={styles.modalContent}>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder="用户名或群聊名称"
                                onChangeText={(e) => { this.setState({ modalText: e }) }}>
                            </TextInput>
                            <Button
                                onPress={() => {
                                    var params = {}
                                    params.type = 'single'
                                    params.username = this.state.modalText
                                    this.setState({ isShowModal: false })
                                    this.createConversation(params)
                                }}
                                style={styles.modalButton}
                                title='创建单聊' />
                            <Button
                                onPress={() => {

                                    JMessage.createGroup({ name: this.state.modalText, desc: "" }, (group) => {
                                        var params = {}
                                        params.type = 'group'
                                        params.groupId = group.id
                                        this.setState({ isShowModal: false })
                                        this.createConversation(params)
                                    }, (error) => {
                                        Alert.alert('create group error !', JSON.stringify(error))
                                    })

                                }}
                                style={styles.modalButton}
                                title='创建群聊' />
                            <Button
                                onPress={() => {
                                    JMessage.createChatRoomConversation("1000", (conversation) => {
                                        var params = {
                                            type: conversation.type,
                                            roomId: conversation.roomId,
                                            name: conversation.roomName,
                                            appKey: conversation.appKey,
                                            owner: conversation.owner,
                                        }
                                        this.setState({ isShowModal: false })
                                        this.enterChatRoom(params)
                                    })
                                }}
                                style={styles.modalButton}
                                title='创建聊天室' />

                            <Button
                                onPress={() => { this.setState({ isShowModal: false }) }}
                                style={styles.modalButton}
                                title='离开' />
                        </View>

                    </View>
                </Modal>
                {this.listView}
            </View>)
    }
}