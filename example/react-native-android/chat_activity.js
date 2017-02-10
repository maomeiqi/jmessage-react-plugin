'use strict'

import React from 'react';
import ReactNative from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

var {
    AppRegistry,
	BackAndroid,
	DeviceEventEmitter,
	View,
	Text,
	Image,
	ListView,
	TouchableHighlight,
	TextInput,
	NativeModules,
	RefreshControl,
	StyleSheet
} = ReactNative;
const JMessageModule = NativeModules.JMessageModule;
import SendTextCell from './send_text_cell';
import ReceiveTextCell from './receive_text_cell';
const RECEIVE_MSG_EVENT = "receiveMsgEvent";
const SEND_MSG_RESULT = "sendMsgResult";

export default class ChatActivity extends React.Component {

	constructor(props) {
		super(props);
		var ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 != r2
		});
		this.msgArr = [];
		this.PAGE_MSG_COUNT = 18;
		this.MSG_OFFSET = this.PAGE_MSG_COUNT;
		this.START = 0;

		this.state = {
			menuVisible: false,
			isKeyboard: true,
			single: this.props.groupId === "",
			groupNum: '(1)',
			inputContent: '',
			recordText: '按住 说话',
			sending: true,
			ds,
			dataSource: ds.cloneWithRows(this.msgArr),
			fetching: true,
		};

		this.renderRow = this.renderRow.bind(this);
		this.renderHeader = this.renderHeader.bind(this);
	}

	componentWillMount() {
		this.loadNextPage();
	}

	componentDidMount() {
	    const { username, appKey, groupId} = this.props;
		BackAndroid.addEventListener('hardwareBackPress', this.hardwareBackPress);
		DeviceEventEmitter.addListener(RECEIVE_MSG_EVENT, this.onReceiveMsg);
		DeviceEventEmitter.addListener(SEND_MSG_RESULT, this.sendMsgResult);
		// Enter conversation, stop showing notification from this conversation.
		JMessageModule.enterConversation(username, appKey, groupId);
		if (this.listView !== null && this.listView !== undefined) {
			this.listView.scrollToEnd();
		}
	}

	hardwareBackPress = () => {
		var navigator = this.props.navigator;
		if (navigator) {
			navigator.pop();
			return true;
		} else {
			return false;
		}
	};

	onReceiveMsg = (map) => {
		console.log("receive msg: " + map.message);
		const {username, appKey, groupId} = this.props;
		var conversation = JSON.parse(map.conversation);
		if (this.state.single) {
			if (conversation.username === username && conversation.appKey === appKey) {
				this.msgArr = this.msgArr.concat(JSON.parse(map.message));
				this.setState({
					dataSource: this.state.ds.cloneWithRows(this.msgArr)
				});
			}
		} else {
			if (conversation.groupId === groupId) {
				this.msgArr = this.msgArr.concat(JSON.parse(map.message));
				this.setState({
					dataSource: this.state.ds.cloneWithRows(this.msgArr)
				});
			}
		}
		if (this.listView !== null && this.listView !== undefined) {
            this.listView.scrollToEnd();
        }
	};

	sendMsgResult = (msg) => {
		var message = JSON.parse(msg);
		for (var i = this.msgArr.length - 1; i >= 0; i--) {
			if (this.msgArr[i].msgId === message.msgId) {
				this.msgArr[i].sendState = message.sendState;
			}
		}
		let newData = JSON.parse(JSON.stringify(this.msgArr));
		this.setState({
			dataSource: this.state.ds.cloneWithRows(newData)
		});
		this.msgArr = newData;
	};

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
		DeviceEventEmitter.removeAllListeners();
	}

	loadNextPage = () => {
		console.log("loading next page");
		const {username, appKey, groupId} = this.props;
		this.setState({
			fetching: true
		});
		JMessageModule.getMessageFromNewest(username, appKey, groupId, this.START, this.PAGE_MSG_COUNT)
			.then((result) => {
				if ("" === result) {
					console.log("No last page");
					this.setState({
						fetching: false
					});
					return;
				}
				let msgData = JSON.parse(result);
				msgData.reverse();
				this.msgArr = this.msgArr.concat(msgData);
				this.MSG_OFFSET = this.START + msgData.length;
				this.START = this.MSG_OFFSET;
				this.setState({
					fetching: false,
					dataSource: this.state.ds.cloneWithRows(this.msgArr)
				});
			}).catch((e) => {
				console.log(e);
				this.setState({
					fetching: false
				});
			});
	}

	backPress = () => {
		this.props.navigator.pop();
	}

	renderHeader = () => {

	}

	renderRow(message: Object, sectionID: number, rowID: number) {
		if (message.direction === "send") {
			switch (message.type) {
				case 'image':
					<SendImageCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }
						sendState = { message.sendState }/>
					break;
				case 'voice':
					<SendVoiceCell
						key = {rowID}
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }
						sendState = { message.sendState }/>
					break;
				case 'location':
					break;
				default:
					return (
						<SendTextCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }
						sendState = { message.sendState }/>
					);
			}
		} else if (message.direction === "receive") {
			switch (message.type) {
				case 'image':
					<ReceiveImageCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }/>
					break;
				case 'voice':
					<ReceiveVoiceCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }/>
					break;
				case 'location':
					<ReceiveLocationCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }/>
					break;
				case 'custom':
					break;
				case 'event':
					break;
				default:
					return (
						<ReceiveTextCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }/>
					);
			}
		}
	}

	sendTxtMsg = () => {
		this._textInput.setNativeProps({
			text: ""
		});
		JMessageModule.sendTxtMsg(this.props.username, this.props.appKey, this.props.groupId, this.state.inputContent)
			.then((msg) => {
				console.log("Sending text message: " + msg);
				this.msgArr.push(JSON.parse(msg));
				console.log("msgArr: " + this.msgArr);
				this.setState({
					dataSource: this.state.ds.cloneWithRows(this.msgArr),
					inputContent: ""
				});
				if (this.listView !== null) {
					this.listView.scrollToEnd();
				}
			}).catch((e) => {
				console.log(e);
				this.setState({
					inputContent: ""
				});
			});

	}

	render() {
		var content =
			<View>
            	<ListView style = { styles.listView }
            		refreshControl={
            			<RefreshControl
            				onRefresh={this.loadNextPage}
            				refreshing={this.state.fetching}
            				tintColor="#ff0000"
            				title="Loading..."
            				colors={['#ff0000', '#00ff00', '#0000ff']}
            				progressBackgroundColor="#ffff00"
            			/>}
					ref={(ref) => this.listView = ref} 
					dataSource = { this.state.dataSource }
					renderHeader = { this.renderHeader }
					renderRow = { this.renderRow }
					enableEmptySections = { true }
   					showsVerticalScrollIndicator={ false }
   				/> 
   			</View>;

		return (
			<View style = { styles.container }>
				<View style = { styles.titlebar }>
					<TouchableHighlight
						style = {styles.backBtn}
						onPress={this.backPress}
						underlayColor = { '#3773cb'}
					>
						<Image 
							style = {{width: 15, height: 25, }}
							source = {{uri: 'back_btn'}}
						/>
					</TouchableHighlight>
					<View style = { {flexDirection: 'row'} }>
						<Text style = { styles.title }>
							{ this.props.title }
						</Text>
						<Text style = { styles.title }>
							{ this.state.single ? '' : this.state.groupNum }
						</Text>
					</View>
					<TouchableHighlight
						style = { styles.rightBtn }
						underlayColor = { '#3773cb'}
						onPress = { this.jumpChatDetailActivity }
						>
						{ this.state.single ? 
							<Image 	style = { {width: 20, height: 25} }
							source = { {uri: 'chat_detail'}}/> 
							:
							<Image 	style = { {width: 20, height: 25} }
							source = { {uri: 'group_detail'}}/>}
						
					</TouchableHighlight>
				</View>
				<View style = { styles.content }>
					{ content }
				</View>
				<View style = { styles.inputContent }>
					{ this.state.isKeyboard ?
						<View style = {{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
						<TouchableHighlight style = { styles.voiceBtn }
							onPress = { () => this.setState({isKeyboard: false}) }>
							<Image style = { styles.voice }
								resizeMode = { 'stretch' }
								source = { {uri: 'voice'} }/>
						</TouchableHighlight>
						<TextInput style = { styles.textInput }
							ref={component => this._textInput = component}
							onChangeText = { (text) => this.setState({inputContent:text}) }
							multilines = { 4 }/>
						</View>
						:
						<View style = {{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
						<TouchableHighlight style = { styles.keyboardBtn }
				 			onPress = { () => this.setState({isKeyboard: true}) }>
				 			<Image style = { {width: 25, height: 20} }
				 				resizeMode = { 'stretch' }
				 				source = { {uri: 'keyboard'}}/>
				 		</TouchableHighlight>
				 		<TouchableHighlight style = { styles.recordBtn }
				 			underlayColor = { '#3773cb' }>
				 			<Text style = { styles.recordText }>
				 				{ this.state.recordText }
				 			</Text>
				 		</TouchableHighlight>
				 		</View>
					}
					{ this.state.inputContent === '' ? 
						<TouchableHighlight 
							style = { styles.moreMenu }>
							<Image style = {{width: 25, height: 25, }}
								source = {{uri: 'more_menu'}}/>
						</TouchableHighlight> 
						:
						<TouchableHighlight
							onPress = {this.sendTxtMsg}
							style = { styles.sendBtn }
							underlayColor = { '#346fc3' }>
							<Text style = { styles.sendText }>
								发送
							</Text>
						</TouchableHighlight>
					}
				</View>
				<View style = { styles.table }>
				</View>
			</View>
		);
	}
}

AppRegistry.registerComponent('ChatActivity', () => ChatActivity);

var styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	titlebar: {
		height: 40,
		flexDirection: 'row',
		backgroundColor: '#3f80dc',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	backBtn: {
		left: 0,
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center'
	},
	title: {
		fontSize: 20,
		color: '#ffffff',
	},
	rightBtn: {
		right: 0,
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center'
	},
	content: {
		flex: 1,
	},
	inputContent: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 50,
		backgroundColor: '#e5e5e5',
	},
	voiceBtn: {
		marginLeft: 10,
	},
	voice: {
		width: 25,
		height: 30,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		padding: 5,
	},
	moreMenu: {
		marginLeft: 5,
		marginRight: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	sendBtn: {
		backgroundColor: '#3f80dc',
		borderRadius: 5,
		marginLeft: 5,
		marginRight: 5,
		padding: 5,
		justifyContent: 'center',
		alignItems: 'center'
	},
	sendText: {
		color: '#ffffff',
		fontSize: 14,
	},
	keyboardBtn: {
		marginLeft: 10,
		marginRight: 10,
	},
	recordBtn: {
		flex: 1,
		borderRadius: 5,
		marginRight: 5,
		backgroundColor: '#3f80dc',
		padding: 5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	recordText: {
		fontSize: 14,
		color: '#ffffff',
	}
});