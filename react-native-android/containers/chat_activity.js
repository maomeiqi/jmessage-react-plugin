'use strict'

var React = require('react-native');
var {
	View,
	Text,
	Image,
	ListView,
	TouchableHighlight,
	TextInput,
	NativeModules,
} = React;

var messages = [];
var JMessageHelper = NativeModules.JMessageHelper;
var ChatActivity = React.createClass({

	getInitialState() {
		var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		return {
			dataSource: ds,
			menuVisible: false,
			isKeyboard: true,
			single: this.props.groupId === 0,
			groupNum: '(10)',
			inputContent: '',
			recordText: '按住 说话',
			sending: true,
		};
	},

	backPress() {
		this.props.navigator.pop();
	},

	getDataSource: function(messages: Array<any>) : ListView.DataSource {
		return this.state.dataSource.cloneWithRows(messages);
	},

	renderRow(message: Object, sectionID: number, rowID: number) {
		if (message.direction === 'send') {
			switch(message.type) {
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
			switch(message.type) {
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
				default:
					<ReceiveTextCell
						avatar = { message.avatar }
						date = { message.date }
						content = { message.content }/>
			}
		}
	},

	sendMsg() {
		JMessageHelper.sendMsg(this.state.inputContent, () => {
			this.setState({sending: false});
		});
	},

	render() {
		var content = this.state.dataSource.getRowCount === 0 ?
			<View style = { styles.container }>
			</View>
			:
			<View style = { styles.container }>
				{ this.state.isLoading ? 
					<View style = { {alignItems: 'center', justifyContent: 'center'} }>
						<Text style = { {fontSize: 24, } }>
							正在加载...
						</Text>
					</View> 
			 		:
            		<ListView style = { styles.listView }
						ref = 'listView'
						dataSource = { this.state.dataSource }
						renderHeader = { this.renderHeader }
						renderRow = { this.renderRow }
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
});

var styles = React.StyleSheet.create({
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

module.exports = ChatActivity