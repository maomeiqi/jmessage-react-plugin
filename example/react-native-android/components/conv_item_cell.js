'use strict';

import React, {Component} from 'react';
import ReactNative from 'react-native';
import Dialog from 'react-native-dialog';
var {
    View,
    Text,
    TouchableHighlight,
    Image,
    NativeModules,
    StyleSheet,
} = ReactNative;
let JMessageModule = NativeModules.JMessageModule;

import ChatActivity from './../pages/chat_activity';

export default class ConvCell extends Component {

    pressRow(rowID) {
        const {conv} = this.props;
        this.props.navigator.push({
            name: 'chatActivity',
            component: ChatActivity,
            params: {
                title: conv.title,
                username: conv.username,
                groupId: conv.groupId,
                appKey: conv.appKey,
            },
        });
    }

    longPressRow(rowID) {
        this.setState({
            rowID: rowID
        });
        Dialog.showActionSheetWithOptions({
            options: ["删除会话"],
        }, (buttonIndex) => {
            if (buttonIndex === 0) {
            const {conv, deleteConv} = this.props;
            JMessageModule.deleteConversation(conv.username, conv.groupId, conv.appKey).then((resp) => {
                if (resp === 0) {
                    deleteConv(rowID);
                }
            }).catch((e) => {
                console.log(e);
            });
            }
        });
    }

    render() {
        const {conv, rowID} = this.props;
        const {title, unreadMsgCnt, lastMsg} = conv;
        var icon;
        if (conv.avatarPath == "") {
            icon = {
                uri: 'jmui_head_icon'
            }
        } else if (conv.avatarPath == "group") {
            icon = {
                uri: 'group'
            }
        } else {
            icon = {
                uri: conv.avatarPath
            }
        }
        var date = new Date(conv.date);
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = date.getDate() + ' ';
        let h = date.getHours() + ':';
        let m = date.getMinutes();
        return (
            <View style={{flex: 1}}>
            <TouchableHighlight
                onLongPress = { () => this.longPressRow(rowID) }
                onPress = { () => this.pressRow(rowID) }
            >
                <View>
                    <View style = { styles.row }>
                        <View style = { {flexDirection: 'row'} }>
                            <Image source = { icon } style = { styles.thumb } />
                                { unreadMsgCnt > 0 && <View style = { styles.msgHint }>
                                    <Text style = { styles.msgHintText }>
                                        { unreadMsgCnt }
                                    </Text>
                                </View> }
                        </View>
                        <View style = { {flex: 1, marginLeft: 10, paddingRight: 5} }>
                            <View style = { {flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text
                                    style = { styles.convName }
                                    numberOfLines = { 1 }
                                >
                                    { title }
                                </Text>
                                <Text style = { styles.convDate }>
                                    { M + D + h + m }
                                </Text>
                            </View>
                            <Text
                                style = { styles.msgContent }
                                numberOfLines = { 1 }
                            >
                                { lastMsg }
                            </Text>
                        </View>
                    </View>
                    <View style = { styles.separator } />
                </View>
        </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: '#f6f6f6',
    },
    separator: {
        height: 1,
        backgroundColor: '#cccccc',
    },
    thumb: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    msgHint: {
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#fa3e32',
        alignSelf: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        top: 0,
        right: 15,
        width: 20,
        height: 20,
    },
    msgHintText: {
        alignSelf: 'center',
        color: '#ffffff',

    },
    convName: {
        flex: 3,
        fontSize: 18,
        color: '#3f80dc',
    },
    convDate: {
        flex: 1,
        color: '#d4d4d4',
        fontSize: 14,
        textAlign: 'center',
    },
    msgContent: {
        fontSize: 16,
        color: '#808080',
    },
});