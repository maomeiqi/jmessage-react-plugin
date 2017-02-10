'use strict'

import React from 'react';
import ReactNative from 'react-native';
import Immutable from 'immutable';
var {
    Alert,
    Animated,
    BackAndroid,
    DeviceEventEmitter,
    Dimensions,
    Image,
    ListView,
    NativeModules,
    PanResponder,
    Text,
    TextInput,
    TouchableHighlight,
    View,
    StyleSheet
} = ReactNative;
import ChatActivity from './chat_activity';
var _convList = [];
var _ds;
var convReducer;
const JMessageModule = NativeModules.JMessageModule;
const RECEIVE_MSG_EVENT = "receiveMsgEvent";
import Dialog from 'react-native-dialog';

export default class Conv extends React.Component {

    constructor(props) {
        super(props);
        _ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        });
        this.state = {
            disconnected: false,
            showDropDownMenu: false,
            menuSelected: '',
            showAddFriendDialog: false,
            showDelConvDialog: false,
            title: '',
            rowID: 0,
            scaleAnimation: new Animated.Value(1),
            y: new Animated.Value(0),
            friendId: '',
            dataSource: _ds.cloneWithRows(_convList),
            fetching: true,
        }

        this.showAddFriendDialog = this.showAddFriendDialog.bind(this);
        this.showDropDownMenu = this.showDropDownMenu.bind(this);
        this.addFriend = this.addFriend.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.longPressRow = this.longPressRow.bind(this);
        this.pressRow = this.pressRow.bind(this);
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
        });
        JMessageModule.getConvList().then((list) => {
            _convList = JSON.parse(list);
            this.setState({
                dataSource: _ds.cloneWithRows(_convList),
                fetching: false
            });
        }).catch((e) => {
            console.log(e);
            this.setState({
                fetching: false
            });
        });

    }

    componentDidMount() {
        DeviceEventEmitter.addListener('networkError', (state) => {
            this.setState({
                disconnected: state
            });
        });
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.state.showDropDownMenu) {
                this.dismissDropDownMenu();
                return true;
            } else if (this.state.showAddFriendDialog) {
                this.dismissAddFriendDialog();
                return true;
            } else if (this.state.showDelConvDialog) {
                this.dismissDelConvDialog();
                return true;
            }
            return false;
        });
        DeviceEventEmitter.addListener(RECEIVE_MSG_EVENT, (map) => {
            console.log("收到消息： " + map.message);
            let conversation = JSON.parse(map.conversation);
            for (let conv in _convList) {
                if (conv.username === conversation.username || conv.groupId === conversation.groupId) {
                    conv = conversation;
                }
            }
            let newData = JSON.parse(JSON.stringify(_convList));
            newData.sort(this.by("date"));
            this.setState({
                dataSource: _ds.cloneWithRows(newData)
            });
            _convList = newData;
        });
        _convList.sort(this.by("date"));
        this.setState({
            dataSource: _ds.cloneWithRows(_convList)
        });
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress');
        DeviceEventEmitter.removeAllListeners();
    }

    by = (date) => {
        return function (o, p) {
            var a, b;
            if (typeof  o === "object" && typeof p === "object" && o && p) {
                a = o[date];
                b = p[date];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a > b ? -1 : 1;
                }
                return typeof a > typeof b ? -1: 1;
            } else {
                throw ("error");
            }
        }
    };

    renderRow(convItem: Object, sectionID: number, rowID: number) {
        var icon;
        if (convItem.avatarPath == "") {
            console.log("avatar null");
            icon = {
                uri: 'jmui_head_icon'
            }
        } else if (convItem.avatarPath == "group") {
            icon = {
                uri: 'group'
            }
        } else {
            icon = {
                uri: convItem.avatarPath
            }
        }
        var date = new Date(convItem.date);
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = date.getDate() + ' ';
        let h = date.getHours() + ':';
        let m = date.getMinutes();
        return (
            <TouchableHighlight 
            	onLongPress = { () => this.longPressRow(rowID) }
            	onPress = { () => this.pressRow(rowID) }>
				<View>
					<View style = { styles.row }>
						<View style = { {flexDirection: 'row'} }>
							<Image source = { icon } style = { styles.thumb } />
							{ convItem.unreadMsgCnt > 0 && <View style = { styles.msgHint }>
								<Text style = { styles.msgHintText }>
									{ convItem.unreadMsgCnt }
								</Text>
							</View> }
						</View>
						<View style = { {flex: 1, marginLeft: 10, paddingRight: 5} }>
							<View style = { {flexDirection: 'row', justifyContent: 'space-between'}}>
								<Text style = { styles.convName }
									numberOfLines = { 1 }>
									{ convItem.title }
								</Text>
								<Text style = { styles.convDate }>
									{ M + D + h + m }
								</Text>
							</View>
							<Text style = { styles.msgContent }
								numberOfLines = { 1 }>
								{ convItem.lastMsg }
							</Text>
						</View>
					</View>
					<View style = { styles.separator } />
				</View>
			</TouchableHighlight>
        );
    }

    pressRow(rowID: number) {
        this.props.navigator.push({
            name: 'chatActivity',
            component: ChatActivity,
            params: {
                title: _convList[rowID].title,
                username: _convList[rowID].username,
                groupId: _convList[rowID].groupId,
                appKey: _convList[rowID].appKey,
            },
        });
    }

    longPressRow(rowID: number) {
        this.setState({
            rowID: rowID
        });
        Dialog.showActionSheetWithOptions({
            options: ["删除会话"],
        }, (buttonIndex) => {
            if (buttonIndex === 0) {
                let conv = _convList[rowID];
                JMessageModule.deleteConversation(conv.username, conv.groupId, conv.appKey).then((resp) => {
                    if (resp === 0) {
                        console.log("delete conversation succedd");
                        _convList.splice(rowID, 1);
                        var array = new Array();
                        array = _convList;
                        this.setState({
                            dataSource: _ds.cloneWithRows(array)
                        });
                    }
                }).catch((e) => {
                    console.log(e);
                });
            }
        })
    }

    renderHeader() {
        if (this.state.disconnected) {
            return (
                <View style = { styles.header }>
                        <Image style = { styles.networkError }
                            source  = { {uri: 'disconnect_icon'} }/>
                        <Text style = { styles.disconnect }>
                            当前网络不可使用
                        </Text>
                </View>
            );
        } else {
            return null;
        }

    }

    // Show menu dialog
    showDropDownMenu() {
        console.log("Show menu dialog");
        Dialog.showActionSheetWithOptions({
            options: ["创建群聊", "添加好友"],
        }, (buttonIndex) => {
            if (buttonIndex === 0) {
                this.createGroup();
            } else {
                this.showAddFriendDialog();
            }
        });
    }

    createGroup() {
        console.log('Create group ');

    }

    addFriend(inputTxt) {
        console.log("Adding friend" + inputTxt);
        JMessageModule.addFriend(inputTxt).then((result) => {
            var newDs = JSON.parse(result);
            _convList = [newDs, ..._convList];
            this.setState({
                dataSource: _ds.cloneWithRows(_convList)
            });
        }).catch((e) => {
            console.log(e);
        });
    }

    showAddFriendDialog() {
        console.log("Show addFriend dialog");
        Dialog.prompt("添加好友", null, [{
            text: "确定",
            onPress: (inputTxt) => {
                this.addFriend(inputTxt);
            }
        }]);
    }

    render() {
        var content = _convList.length === 0 ?
            <View style = { styles.container }>
            { this.state.fetching && <View style = { {alignItems: 'center', justifyContent: 'center'} }>
                    <Text style = { {fontSize: 24, }}>
                        正在加载...
                    </Text>
                </View> }
            </View> :
            <ListView style = { styles.listView }
                ref = 'listView'
                dataSource={ this.state.dataSource }
                renderHeader={ this.renderHeader }
                renderRow={ this.renderRow }
                enableEmptySections={ true }
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={ false }/>;


        return (
            <View style = { styles.container }>
					<View style = { styles.titlebar }>
						<Text style = { styles.titleLeft }>
						</Text>
						<Text style = { styles.title }>
							会话
						</Text>
						<TouchableHighlight
							style = { styles.titlebarBtn }
							underlayColor = { '#3773cb'}
							onPress = { this.showDropDownMenu }>
							<Image style = { styles.titlebarImage }
								source = { {uri: 'msg_titlebar_right_btn'}}/>
						</TouchableHighlight>
					</View>
                    { content }
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    titlebar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3f80dc'
    },
    title: {
        textAlign: 'center',
        fontSize: 22,
        color: '#ffffff'
    },
    titleLeft: {
        width: 40,
        height: 40,
    },
    titlebarBtn: {
        right: 0,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    titlebarImage: {
        width: 20,
        height: 20,
    },
    dropDownMenu: {
        borderRadius: 5,
        left: Dimensions.get('window').width / 3,
        top: Dimensions.get('window').height / 4,
        right: Dimensions.get('window').width / 4,
        bottom: Dimensions.get('window').height / 2,
        backgroundColor: '#3f80dc',
    },
    dropDownMenuContent: {
        flex: 1
    },
    menuBackground: {
        flex: 1,
        paddingTop: 5,
        paddingBottom: 12,
    },
    menuItem0: {
        marginTop: 10,
        marginRight: 35,
        paddingLeft: 15,
    },
    menuItem1: {
        marginTop: 5,
        paddingLeft: 15,
    },
    addFriendDialog: {
        borderRadius: 10,
        left: Dimensions.get('window').width / 8,
        top: Dimensions.get('window').height / 4,
        right: Dimensions.get('window').width / 8,
        bottom: Dimensions.get('window').height / 3,
        backgroundColor: '#ffffff',
    },
    bottomLeftBtn: {
        borderTopWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: '#d3d3d3',
        flex: 1,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomRightBtn: {
        borderColor: '#d3d3d3',
        borderTopWidth: 0.5,
        flex: 1,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteConvDialog: {
        borderRadius: 10,
        top: Dimensions.get('window').height / 2.5,
        right: Dimensions.get('window').width / 8,
        bottom: Dimensions.get('window').height / 2.5,
        left: Dimensions.get('window').width / 8,
        backgroundColor: '#ffffff',
    },
    listView: {
        flex: 1,

    },
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
    header: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '#ffdfe0'
    },
    networkError: {
        width: 25,
        height: 25,
        marginLeft: 30,
    },
    disconnect: {
        fontSize: 16,
        color: '#836567',
        marginLeft: 10,
    }

});