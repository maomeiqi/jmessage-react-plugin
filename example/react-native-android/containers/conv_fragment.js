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
import DialogAndroid from 'react-native-dialogs';
var JMessageHelper = NativeModules.JMessageHelper;
var _convList = [];
var convReducer;

export default class Conv extends React.Component {

    constructor(props) {
        super(props);
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
        }

        this.showAddFriendDialog = this.showAddFriendDialog.bind(this);
        this.showDropDownMenu = this.showDropDownMenu.bind(this);
        this.dismissDropDownMenu = this.dismissDropDownMenu.bind(this);
        this.dismissAddFriendDialog = this.dismissAddFriendDialog.bind(this);
        this.dismissDelConvDialog = this.dismissDelConvDialog.bind(this);
        this.addFriend = this.addFriend.bind(this);
        this.createGroup = this.createGroup.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.longPressRow = this.longPressRow.bind(this);
        this.pressRow = this.pressRow.bind(this);
        this.delConvClick = this.delConvClick.bind(this);
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
        });
    }

    componentDidMount() {
        const {
            loadConversations
        } = this.props.actions;
        const {
            conversationList
        } = this.props.state;
        loadConversations();
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
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress');
        DeviceEventEmitter.removeAllListeners();
    }


    renderRow(convItem: Object, sectionID: number, rowID: number) {
        return (
            <TouchableHighlight 
            	onLongPress = { () => this.longPressRow(rowID) }
            	onPress = { () => this.pressRow(rowID) }>
				<View>
					<View style = { styles.row }>
						<View style = { {flexDirection: 'row'} }>
							<Image style = { styles.thumb } source = { {uri: convItem.avatarPath } } />
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
									{ convItem.date }
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
        if (!this.state.showDelConvDialog && !this.state.showAddFriendDialog) {
            console.log('rowID ' + rowID + ' long pressed!');
            this.setState({
                rowID: rowID
            });
            Animated.spring(this.state.scaleAnimation, {
                toValue: 1
            }).start(() => this.setState({
                showDelConvDialog: true,
                title: _convList[rowID].title,
            }));
        }
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

    showDropDownMenu() {
        if (!this.state.showAddFriendDialog && !this.state.showDelConvDialog) {
            if (this.state.showDropDownMenu) {
                this.dismissDropDownMenu();
            } else {
                this.state.y.setValue(-600);
                this.state.scaleAnimation.setValue(1);
                Animated.spring(this.state.y, {
                    toValue: 0
                }).start();
                this.setState({
                    showDropDownMenu: true
                });
            }
        }
    }

    dismissDropDownMenu() {
        Animated.timing(this.state.y, {
            toValue: -600
        }).start(() => {
            this.setState({
                showDropDownMenu: false
            });
        });
    }


    createGroup() {
        console.log('Create group ');
        this.dismissDropDownMenu();
        const {
            createGroup
        } = this.props.actions;
        createGroup();
    }

    addFriend() {
        const {
            addFriend
        } = this.props.actions;
        addFriend(this.state.friendId);
        this.dismissAddFriendDialog();
        // JMessageHelper.addFriend(this.state.friendId, (result) => {
        //     this.dismissAddFriendDialog();
        //     var newDs = JSON.parse(result);
        //     this.setState({ dataSource: this.getDataSource([newDs, ..._convList]) });
        //     _convList = [newDs, ..._convList];
        // });
    }

    showAddFriendDialog() {
        console.log("Show addFriend dialog");
        this.dismissDropDownMenu();
        this.state.y.setValue(-600);
        this.state.scaleAnimation.setValue(1);
        Animated.spring(this.state.y, {
            toValue: 0
        }).start();
        this.setState({
            showAddFriendDialog: true
        });
    }

    dismissAddFriendDialog() {
        console.log('dismissing dialog');
        Animated.timing(this.state.y, {
            toValue: -600,
        }).start(() => {
            this.setState({
                showAddFriendDialog: false
            });
        });
    }

    delConvClick() {
        const {
            deleteConversation
        } = this.props.actions;
        var conversation = _convList[this.state.rowID];
        deleteConversation(conversation, this.state.rowID);
        this.dismissDelConvDialog();
    }

    dismissDelConvDialog() {
        Animated.timing(this.state.scaleAnimation, {
            toValue: 0,
        }).start(() => this.setState({
            showDelConvDialog: false
        }));
    }

    render() {
        const {
            conversationReducer
        } = this.props.state;
        _convList = conversationReducer.convList;
        var content = conversationReducer.dataSource.length === 0 ?
            <View style = { styles.container }>
			{ conversationReducer.fetching && <View style = { {alignItems: 'center', justifyContent: 'center'} }>
					<Text style = { {fontSize: 24, }}>
						正在加载...
					</Text>
				</View> } 
			</View> :
            <ListView style = { styles.listView }
				ref = 'listView'
				dataSource = { conversationReducer.dataSource }
				renderHeader = { this.renderHeader }
				renderRow = { this.renderRow }
                enableEmptySections = { true }
				keyboardDismissMode="on-drag"
   				keyboardShouldPersistTaps={ true }
   				showsVerticalScrollIndicator={ false }/>;

        return (
            <View style = { styles.container }>
            	<Animated.Modal
					style = { [styles.dropDownMenu, {transform: [{translateY: this.state.y}, {scale: this.state.scaleAnimation}]}] }
					visible = { this.state.showDropDownMenu }>
					<View style = { styles.dropDownMenuContent }>
						<View style = { styles.menuBackground }>
                            <TouchableHighlight
                                onPress = { this.dismissDropDownMenu }
                                underlayColor = { '#346fc3' }
                                style = { {position: 'absolute', top: 10, right: 10} }>
                                <Image style = { {width: 25, height: 25,} }
                                    source = { {uri: 'del_btn'} } />
                            </TouchableHighlight>
							<TouchableHighlight
								onPress = { this.createGroup }
								underlayColor = { '#346fc3' }
								style = { styles.menuItem0 }>
								<Text style = { {fontSize: 18, color: '#d8e3f5',}}>
									发起群聊
								</Text>
							</TouchableHighlight>
							<TouchableHighlight
								onPress = { this.showAddFriendDialog }
								underlayColor = { '#346fc3' }
								style = { styles.menuItem1 }>
								<Text style = { {fontSize: 18, color: '#d8e3f5',}}>
									添加朋友
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				</Animated.Modal>

				<Animated.Modal
					style = { [styles.addFriendDialog, {transform: [{translateY: this.state.y}, {scale: this.state.scaleAnimation}]}] }
					visible = { this.state.showAddFriendDialog }>
					<View style = { styles.container }>
						<Text style = { {fontSize: 18, marginTop: 15, color: '#008000', alignSelf: 'center'}}>
							添加好友
						</Text>
						<View style = { {height: 1, margin: 10, backgroundColor: '#d3d3d3'} } />
						<Text style = { {color: '#808080', alignSelf: 'center'}}>
							输入你要添加的好友用户名
						</Text>
						<TextInput style = { {margin: 10, padding: 5, color: '#000000', fontSize: 20} }
							onChangeText = { (text) => this.setState({friendId: text})} />
						<View style = { {flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0} }>
							<TouchableHighlight style = { styles.bottomLeftBtn }
								underlayColor = { '#d4d4d4' }
								onPress = { this.dismissAddFriendDialog }>
								<Text style = { {color: '#808080', fontSize: 16} }>
									取消
								</Text>
							</TouchableHighlight>
							<TouchableHighlight style = { styles.bottomRightBtn }
								underlayColor = { '#d4d4d4' }
								onPress = { this.addFriend }>
								<Text style = { {color: '#808080', fontSize: 16} }>
									确定
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				</Animated.Modal>

				<Animated.Modal
					style = { [styles.deleteConvDialog, {transform: [{scale: this.state.scaleAnimation}]}] }
					visible = { this.state.showDelConvDialog }>
					<View style = { styles.container }>
						<View style = { {flexDirection: 'row', justifyContent: 'space-between'} }>
						<Text style = { {fontSize: 22, marginTop: 10, marginBottom: 10, marginLeft: 20, marginRight: 20, color: '#3f81df'}}>
							{ this.state.title }
						</Text>
							<TouchableHighlight style = { {backgroundColor: '#ff4081',padding: 5, alignItems: 'center', 
								justifyContent: 'center', borderRadius: 5} }
								onPress = { this.dismissDelConvDialog }>
								<Text style = { {fontSize: 14, color: '#ffffff'} }>
									关闭
								</Text>
							</TouchableHighlight>
						</View>
						<View style = { {height: 1, backgroundColor: '#d3d3d3'} }/>
						<TouchableHighlight style = { {position: 'absolute', bottom: 0, left: 0, right: 0,
							paddingTop: 10, paddingBottom: 10, paddingLeft: 20} }
							underlayColor = { '#dddddd' }
							onPress = { this.delConvClick }>
							<Text style = { {fontSize: 18, color: '#4e4e4e'}}>
								删除该聊天
							</Text>
						</TouchableHighlight>
					</View>
				</Animated.Modal>

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