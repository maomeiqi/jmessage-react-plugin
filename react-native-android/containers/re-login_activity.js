'use strict'

var React = require('react-native');
var {
	BackAndroid,
	Component,
	Text,
	View,
	TouchableHighlight,
	Image,
	TextInput,
	ScrollView,
	NativeModules,
} = React;
import MainActivity from './main_activity';
import LoginActivity from './login_activity';
import RegisterActivity from './register_activity';
import LoadingAnimation from './loading_animation';
var JMessageHelper = NativeModules.JMessageHelper;
class ReloginActivity extends Component {

	constructor(props) {
		super(props);

		this.state = {
			password: '',
		};

		this.reLogin = this.reLogin.bind(this);
		this.jumpLoginActivity = this.jumpLoginActivity.bind(this);
		this.jumpRegisterActivity = this.jumpRegisterActivity.bind(this);
	}

	reLogin() {
		JMessageHelper.login(true, '', this.state.password, () => {
			console.log('Re-login success ');
			this.props.navigator.replace({name: 'mainActivity', component: MainActivity});
		});
	}

	jumpLoginActivity() {
		this.props.navigator.push({
			name: 'loginActivity',
			component: LoginActivity,
			params: {
				showBackBtn: true
			}
		});
	}

	componentDidMount() {
		console.log('this.props.username: ' + this.props.username);
		var navigator = this.props.navigator;
		BackAndroid.addEventListener('hardwareBackPress', () => {
            if (navigator && navigator.getCurrentRoutes() > 0) {
                navigator.pop();
                return true;
            }
            return false;
        });
	}

	componentWillUnmount() {
		BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
	}

	jumpRegisterActivity() {
		this.props.navigator.push({name: 'registerActivity', component: RegisterActivity});
	}

	render() {
		return (
			<View style = {styles.container}>
				<View style = { styles.titlebar }>
					<Text style = { styles.title }>
						极光IM
					</Text>
				</View>
				<View style = { styles.content }>
					<Text style = { styles.switchText }
						onPress = { this.jumpLoginActivity }>
						切换账号
					</Text>
					<Image style = { styles.headIcon }
						source = { {uri: 'head_icon'} }/>
					<Text style = { styles.username }>
						{ this.props.username }
					</Text>
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
						onPress = { this.reLogin }
						underlayColor = { '#006400'}>
						<Text style = { styles.btnText }>
							登录
						</Text>
					</TouchableHighlight>
					<Text style = { {color: '#555555', position: 'absolute', right: 0, marginTop: 15 } }>
						忘记密码？
					</Text>
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

var styles = React.StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		marginLeft: 28,
		marginRight: 28
	},
	titlebar: {
		height: 40,
		alignItems: 'center',
		justifyContent: 'center', 
		backgroundColor: '#3f80dc'
	},
	title: {
		color: '#ffffff',
		fontSize: 22,
	},
	switchText: {
		alignSelf: 'flex-end',
		marginTop: 20,
		fontSize: 20,
		color: '#555555'
	},
	headIcon: {
		width: 80,
		height: 80,
		alignSelf: 'center',
	},
	username: {
		marginTop: 10,
		alignSelf: 'center',
		color: '#555555',
		fontSize: 18,
		fontWeight: 'bold'
	},
	separator: {
		marginTop: 20,
		height: 1,
		backgroundColor: '#c1d3cc',
	},
	inputContainer: {
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
	registerContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
		marginBottom: 30,
	}
});

module.exports = ReloginActivity