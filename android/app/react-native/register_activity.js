'use strict'

var React = require('react-native');
var {
	Text,
	View,
	Image,
	TextInput,
	TouchableHighlight,
	NativeModules,
} = React;
var JMessageHelper = NativeModules.JMessageHelper;
var LoadingAnimation = require('./loading_animation');

var RegisterActivity = React.createClass({

	getInitialState() {
		return {
			username: '',
			password: '',
		};
	},

	backOnClick() {
		this.props.navigator.pop();
	},

	register() {
		console.log('Begin registering');
		JMessageHelper.register(this.state.username, this.state.password, () => {
			console.log('user register succeed');
			this.props.navigator.push({
				name: 'loginDialog',
				params: {
					username: this.state.username,
					password: this.state.password,
				}
			});
		});
	},

	render() {
		return (
			<View style = { styles.container }>
				<View style = { styles.titlebar }>
					<TouchableHighlight
						style = { {justifyContent: 'center', alignItems: 'center', width: 40, height: 40} }
						underlayColor = { '#3773cb' }
						onPress = { this.backOnClick }>
							<Image style = { {width: 15, height: 25} } source = { {uri: 'back_btn'} }/>
					</TouchableHighlight>
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
							placeholder = { '用户名(数字、字母、_组成)' }
							placeholderTextColor = { '#808080' }
							maxLength = { 128 }
							onChangeText = { (text) => this.setState({username: text}) }/>
					</View>
					<View style = { styles.separator }/>
					<View style = { styles.inputContainer }>
						<Image style = { styles.inputIcon }
							source = { {uri: 'password'}}/>
						<TextInput style = { styles.input }
							placeholder = { '用户密码' }
							placeholderTextColor = { '#808080' }
							maxLength = { 128 }
							onChangeText = { (text) => this.setState({password: text}) }/>
					</View>
					<View style = { styles.separator }/>
					<TouchableHighlight
						style = { styles.registerBtn }
						underlayColor = { '#346fc3' }
						onPress = { this.register }>
						<Text style = { styles.btnText }>
							注册
						</Text>
					</TouchableHighlight>
				</View>
			</View>
		)
	}
});

var styles = React.StyleSheet.create({
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
	registerBtn: {
		marginTop: 25,
		padding: 10,
		backgroundColor: '#3f80dc',
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center'
	},
	btnText: {
		color: '#ffffff',
		fontSize: 18,
	},

});

module.exports = RegisterActivity