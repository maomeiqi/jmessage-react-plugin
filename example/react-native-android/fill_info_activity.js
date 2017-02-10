'use strict'

import React from 'react';
import ReactNative from 'react-native';

var {
	View,
	Text,
	TextInput,
	Image,
	TouchableHighlight,
	NativeModules,
	StyleSheet
} = ReactNative;
const JMessageModule = NativeModules.JMessageModule;

export default class FillInfoActivity extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			takePhotoPressed: false,
			nickname: '',
			hasSetAvatar: false,
			avatarPath: '',
		}
	}

	takePhoto() {
		this.setState({
			takePhotoPressed: true
		});
		console.log('take photo btn pressed!');
		// this.props.navigator.push({name: 'cameraActivity'});
		JMessageModule.takePhoto(this.props.username, (path) => {
			this.setState({
				avatarPath: path,
				hasSetAvatar: true
			});
		});
	}

	finishClick() {
		if (this.state.nickname != '') {
			JMessageModule.finishFillInfo(this.state.nickname, () => {
				this.props.navigator.replace({
					name: 'mainActivity'
				});
			});
		}
	}

	componentDidMount() {
		console.log('this.props.username ' + this.props.username);
	}

	componentWillUnmount() {
		console.log('ComponentWillUnmount!');

	}

	render() {
		return (
			<View style = { styles.container }>
				<View style = { styles.titlebar }>
					<Text style = { styles.title }>
						极光IM
					</Text>
				</View>
				<View style = { styles.content }>
					<View style = { styles.inputContainer }>
						<TextInput style = { styles.input }
							placeholder = { '输入您的昵称' }
							placeholderTextColor = { '#808080' }
							multilines = { true }
							onChangeText = { (text) => this.setState({nickname: text}) }/>
						<TouchableHighlight
							underlayColor = { '#808080' }
							onPress = { this.takePhoto }>
							<View>
								<Image style = { styles.takePhotoBtn }
									source = { this.state.hasSetAvatar ? 
									(this.state.avatarPath == '' ? {uri: 'take_photo_fix_profile'} : {uri: this.state.avatarPath}) : 
									(this.state.takePhotoPressed ? {uri: 'take_photo_fix_profile_pre'} : {uri: 'take_photo_fix_profile'}) }/>
							</View>
						</TouchableHighlight>
					</View>
					<TouchableHighlight
						underlayColor = { '#6fd66b' }
						style = { styles.finishBtn }
						onPress = { this.finishClick }>
						<Text style = { styles.btnText }>
							完成
						</Text>
					</TouchableHighlight>
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 40,
		backgroundColor: '#3f80dc',
	},
	title: {
		color: '#ffffff',
		fontSize: 24,
	},
	content: {
		marginLeft: 20,
		marginRight: 20,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginTop: 20,
	},
	input: {
		flex: 1,
		fontSize: 16,
	},
	takePhotoBtn: {
		width: 70,
		height: 70,
	},
	finishBtn: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 25,
		padding: 10,
		borderWidth: 1,
		borderColor: '#b9ebb8',
		borderRadius: 5,
		backgroundColor: '#b9ebb8',
	},
	btnText: {
		fontSize: 22,
		color: '#ffffff',
	}
});