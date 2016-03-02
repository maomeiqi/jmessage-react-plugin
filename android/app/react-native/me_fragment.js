'use strict'

var React = require('react-native');
var {
	View,
	Text,
	TouchableHighlight,
	NativeModules,
} = React;

var JMessageHelper = NativeModules.JMessageHelper;
var Me = React.createClass({

	logout() {
			JMessageHelper.logout((username) => {
			console.log('User has logged out ');
			this.props.navigator.replace({
				name: 'reloginActivity',
				params: {
					username: username
				}
			});
		});
	},

	render() {
		return (
				<View style = { styles.container }>
					<Text style = { styles.title }>
						Me Fragment
					</Text>
					<TouchableHighlight
						onPress = { () => this.logout() }
						style = { styles.logoutBtn }>
						<Text style = { styles.btnText }>
							登出
						</Text>
					</TouchableHighlight>
				</View>
			);
	}
});

var styles = React.StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	title: {
		fontSize: 30,
		color: '#92283e'
	},
	logoutBtn: {
		padding: 10,
		backgroundColor: '#6fd66b',
		borderRadius: 5,
		alignItems: 'center',
	},
	btnText: {
		fontSize: 18,
		color: '#ffffff'
	}
});

module.exports = Me