'use strict'

import React from 'react';
import ReactNative from 'react-native';
import JMessageModule from 'jmessage-react-plugin';

var {
	Animated,
	Text,
	View,
	TextInput,
	TouchableHighlight,
	Image,
	Switch,
	Platform,
	NativeModules,
	BackAndroid,
	StyleSheet
} = ReactNative;
import RegisterActivity from './register_activity';
import MainActivity from './main_activity';

export default class LoginActivity extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			switchIsOn: false,
			testEnvironment: false,
			username: '',
			password: '',
		}

		this.backOnClick = this.backOnClick.bind(this);
		this.login = this.login.bind(this);
		this.jumpRegisterActivity = this.jumpRegisterActivity.bind(this);
	}

	backOnClick() {
		this.props.navigator.pop();
	}

	login() {
		console.log('username: ' + this.state.username);
		JMessageModule.login(this.state.username, this.state.password, (resp) => {
			if (resp == 0) {
				console.log('Login success!');
				//用一个新路由即MainActivity替换掉当前路由
				this.props.navigator.replace({
					name: 'mainActivity',
					component: MainActivity
				});
			}
		});
	}

	jumpRegisterActivity() {
		this.props.navigator.push({
			name: 'registerActivity',
			component: RegisterActivity
		});
	}

	componentDidMount() {
		console.log('this.props.showBackBtn: ' + this.props.showBackBtn);
		var navigator = this.props.navigator;
		BackAndroid.addEventListener('hardwareBackPress', function() {
			if (navigator) {
				navigator.pop();
				return true;
			}
			return false;
		});
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress');
	}

	render() {
		return (
			<View style = { styles.container }>
				<View style = { styles.titlebar }>
					{this.props.showBackBtn ? 
						<TouchableHighlight
						style = { {justifyContent: 'center', alignItems: 'center', width: 40, height: 40} }
						underlayColor = { '#3773cb' }
						onPress = { this.backOnClick }>
							<Image style = { {width: 15, height: 25} } source = { {uri: 'back_btn'} }/>
						</TouchableHighlight> : 
					<Text style = { {width: 40, height: 40} }>
					</Text>
					}
					<Text style = { styles.title }>
						极光IM
					</Text>
					<Text style = { {width: 40, height: 40}}>
					</Text>
				</View>
				<View style = { styles.content }>
					<View style = { styles.inputContainer }>
						<Image style = { styles.inputIcon }
							source = { {uri: 'username'}}/>
						<TextInput style = { styles.input }
							placeholder = { '用户名' }
							placeholderTextColor = { '#808080' }
							maxLength = { 128 }
							onChangeText = { (text) => this.setState({username: text})}/>
					</View>
					<View style = { styles.separator }/>
					<View style = { styles.inputContainer }>
						<Image style = { styles.inputIcon }
							source = { {uri: 'password'}}/>
						<TextInput style = { styles.input }
							placeholder = { '用户密码' }
							placeholderTextColor = { '#808080' }
							maxLength = { 128 }
							secureTextEntry = { true }
							onChangeText = { (text) => this.setState({password: text}) }/>
					</View>
					<View style = { styles.separator }/>
					<TouchableHighlight
						style = { styles.loginBtn }
						underlayColor = { '#006400' }
						onPress = { this.login }>
						<Text style = { styles.btnText }>
							登录
						</Text>
					</TouchableHighlight>
					<View style = { styles.pickerContainer }>
						<Switch
							value = { this.state.switchIsOn }
							onValueChange = { (value) => this.setState({switchIsOn: value})}>
						</Switch>
						<Text style = { {fontSize: 18} }>
							测试环境
						</Text>
						<Text style = { {color: '#555555', position: 'absolute', right: 0, alignSelf: 'center'} }>
							忘记密码？
						</Text>
					</View>
					<View style = { styles.registerContainer }>
						<TouchableHighlight
							underlayColor = { 'transparent' }
							onPress = { this.jumpRegisterActivity }>
							<View>
								<Image style = { {alignSelf: 'center', width: 20, height: 20} }
									source = { {uri: 'login_register'} }/>
								<Text>
									注册
								</Text>
							</View>
						</TouchableHighlight>
					</View>
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
		backgroundColor: '#3f80dc',
		height: 40,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	title: {
		color: '#ffffff',
		fontSize: 22,
	},
	content: {
		flex: 1,
		marginLeft: 28,
		marginRight: 28,
	},
	inputContainer: {
		marginTop: 25,
		flexDirection: 'row',
		alignItems: 'center',
	},
	inputIcon: {
		width: 20,
		height: 20,
		alignSelf: 'flex-start',
		top: 18,
	},
	input: {
		flex: 1,
		marginLeft: 5,
		fontSize: 18,
		color: '#000000',
		borderWidth: 1,
		borderColor: '#ffffff'
	},
	separator: {
		height: 1,
		backgroundColor: '#c1d3ec'
	},
	loginBtn: {
		marginTop: 25,
		padding: 10,
		backgroundColor: '#6fd66b',
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center'
	},
	btnText: {
		color: '#ffffff',
		fontSize: 18,
	},
	pickerContainer: {
		marginTop: 20,
		flexDirection: 'row',
		alignItems: 'center',
	},
	registerContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
		marginBottom: 30,
	}

});