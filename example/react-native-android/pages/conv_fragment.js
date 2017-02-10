'use strict';

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
import ConvCell from './../components/conv_item_cell';
var _convList = [];
var _ds;
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
        };

        this.showAddFriendDialog = this.showAddFriendDialog.bind(this);
        this.showDropDownMenu = this.showDropDownMenu.bind(this);
        this.addFriend = this.addFriend.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
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
            for (let i=0; i < _convList.length; i++) {
                if (_convList[i].id === conversation.id) {
                    _convList[i] = conversation;
                    console.log("update conversation");
                }
            }
            let newData = JSON.parse(JSON.stringify(_convList));
            newData.sort(this.by("date"));
            this.setState({
                dataSource: _ds.cloneWithRows(newData)
            });
            _convList = newData;
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

    renderRow = (rowData, sectionID, rowID) => {
        console.log(rowID + " " + rowData.lastMsg);
        return (
            <ConvCell
                key = {rowData.id}
                conv = {rowData}
                rowID = {rowID}
                navigator = {this.props.navigator}
                deleteConv = {this.deleteConv}
            />
        );
    };

    deleteConv = (rowID) => {
        _convList.splice(rowID, 1);
        var array = new Array();
        array = _convList;
        this.setState({
            dataSource: _ds.cloneWithRows(array)
        });
    };

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