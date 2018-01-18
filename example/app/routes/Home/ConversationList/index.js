'use strict';

import React from 'react';
import ReactNative, { ScrollView } from 'react-native';
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

    getListItem(conversation, id) {
        var item = this.state.data[id]
        let newItem = {...item}
        newItem.conversation = conversation
        newItem.type = conversation.conversationType
        if (conversation.conversationType === "single") {
            newItem.appKey = conversation.target.appKey
            newItem.key = conversation.target.username
            newItem.username = conversation.target.username
            newItem.avatarThumbPath = conversation.target.avatarThumbPath
            newItem.displayName = conversation.target.nickname
            console.log("nickname: " + newItem.displayName)
            if (newItem.displayName == "") {
                newItem.displayName = conversation.target.username
            }
            if (newItem.avatarThumbPath === "") {
                JMessage.getUserInfo(newItem, (userInfo) => {
                    console.log("Get user info succeed")
                    this.setState((state) => {
                        const refresh = new Map(state.refresh)
                        refresh.set(newItem.username, !refresh.get(newItem.username))
                        return {refresh}
                    })
                }, (error) => {
                    console.log("Get user info failed, " + JSON.stringify(error))
                })
            }
        } else if (conversation.conversationType === "group") {
            newItem.appKey = conversation.target.ownerAppKey
            newItem.key = conversation.target.id
            newItem.groupId = conversation.target.id
            newItem.displayName = conversation.target.name
            newItem.avatarThumbPath = conversation.target.avatarThumbPath
            if (newItem.avatarThumbPath === "") {
                JMessage.getGroupInfo({id: groupId}, (groupInfo) => {
                    console.log("Get group info succeed")
                    this.setState((state) => {
                        const refresh = new Map(state.refresh)
                        refresh.set(newItem.groupId, !refresh.get(newItem.groupId))
                        return {refresh}
                    })
                }, (error) => {
                    console.log("Get group info failed, " + JSON.stringify(error))
                })
            }
        } else {
            newItem.appKey = conversation.target.appKey
            newItem.key = conversation.target.roomId
            newItem.roomId = conversation.target.roomId
            newItem.avatarThumbPath = "../../../resource/chat-icon.png"
            newItem.displayName = conversation.target.roomName
            newItem.memberCount = conversation.target.memberCount
            newItem.maxMemberCount = conversation.target.maxMemberCount
        }

        if (conversation.latestMessage === undefined) {
            return newItem
        }

        if (conversation.latestMessage.type === 'text') {
            newItem.latestMessageString = conversation.latestMessage.text
        }

        if (conversation.latestMessage.type === 'image') {
            newItem.latestMessageString = '[图片]'
        }

        if (conversation.latestMessage.type === 'voice') {
            newItem.latestMessageString = '[语音]'
        }

        if (conversation.latestMessage.type === 'file') {
            newItem.latestMessageString = '[文件]'
        }

        return newItem
    }

    reloadConversationList() {
        JMessage.getConversations((result) => {
            var data = result.map((conversation, index) => {
                return this.getListItem(conversation, index)
            })
            data.sort((a, b) => {
                return b.latestMessage.createTime - a.latestMessage.createTime
            })
            this.setState({
                data: data
            })
        }, (error) => {
            Alert.alert(JSON.stringify(error))
        })
    }

    enterConversation(item) {
        this.reloadConversationList()
        JMessage.enterConversation(item, (status) => { }, (error) => { })
        this.props.navigation.navigate('Chat', {
            conversation: item
        })
    }

    createConversation(params, id) {
        JMessage.createConversation(params, (conv) => {
            var item = this.getListItem(conv, id)
            this.enterConversation(item)
        }, (error) => {
            Alert.alert('create conversation error !', JSON.stringify(error))
        })
    }

    enterChatRoom(item, id) {
        JMessage.enterChatRoom(item, (conversation) => {
            this.props.navigation.navigate('Chat', {
                conversation: this.getListItem(conversation, id)
            })
        }, (error) => {
            console.alert("error, code: " + error.code + ", description: " + error.description)
        })
    }

    render() {
        this.listView = <FlatList
            data={
                this.state.data
            }
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
                                        this.enterConversation(item)
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
                                    this.createConversation(params, item.id)
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
                                        this.createConversation(params, item.id)
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
                                        this.enterChatRoom(params, item.id)
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