'use strict'

import React from 'react';
import ReactNative from 'react-native';
import JMessageModule from 'jmessage-react-plugin';

var {
	BackAndroid,
	View,
	Text,
	Image,
	ListView,
	TouchableHighlight,
	TextInput,
	NativeModules,
	StyleSheet
} = ReactNative;

var messages = [];
export default class ChatActivity extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			menuVisible: false,
			isKeyboard: true,
			single: this.props.groupId === 0,
			groupNum: '(1)',
			inputContent: '',
			recordText: '按住 说话',
			sending: true
		}

		this.backPress = this.backPress.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.renderHeader = this.renderHeader.bind(this);
		this.sendMsg = this.sendMsg.bind(this);
	}

	componentWillMount() {
		const {
			updateGroupTitle,
			getMessages
		} = this.props.actions;
		if (!this.state.single) {
			updateGroupTitle(this.props.groupId);
		}
		getMessages(this.props.username, this.props.groupId, this.props.appKey);
	}

	componentDidMount() {
		BackAndroid.addEventListener('hardwareBackPress', this.hardwareBackPress);
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

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
	}


	backPress() {
		this.props.navigator.pop();
	}

	renderHeader() {

	}

	renderRow(message: Object, sectionID: number, rowID: number) {
		if (message.direction === 'send') {
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
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }
						sendState = { message.sendState }/>
					break;
				case 'location':
					break;
				default:
					<SendTextCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }
						sendState = { message.sendState }/>
			}
		} else {
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
					<ReceiveTextCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }/>
			}
		}
	}

	sendMsg() {
		JMessageModule.sendMsg(this.state.inputContent, () => {
			this.setState({
				sending: false
			});
		});
	}

	render() {
		const {
			messageReducer
		} = this.props.state;
		messages = messageReducer.msgList;
		var content = messageReducer.dataSource.length === 0 ?
			<View style = { styles.container }>
			</View> :
			<View style = { styles.container }>
				{ messageReducer.fetching ? 
					<View style = { {alignItems: 'center', justifyContent: 'center'} }>
						<Text style = { {fontSize: 24, } }>
							正在加载...
						</Text>
					</View> 
			 		:
            		<ListView style = { styles.listView }
						ref = 'listView'
						dataSource = { messageReducer.dataSource }
						renderHeader = { this.renderHeader }
						renderRow = { this.renderRow }
						enableEmptySections = { true }
						keyboardDismissMode="on-drag"
   						keyboardShouldPersistTaps={ true }
   						showsVerticalScrollIndicator={ false }/> 
	   			}
   			</View>;

		return (
			<View style = { styles.container }>
				<View style = { styles.titlebar }>
					<TouchableHighlight
						style = { styles.backBtn }
						underlayColor = { '#3773cb'}
						onPress = { this.backPress }>
						<Image style = { {width: 15, height: 25, } }
							source = { {uri: 'back_btn'}}/>
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
						onPress = { this.jumpChatDetailActivity }>
						<Image 	style = { {width: 20, height: 25} }
							source = { {uri: 'chat_detail'}}/>
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
							onPress = { this.sendMsg }
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