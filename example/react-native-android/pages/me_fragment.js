'use strict'

import React from 'react';
import ReactNative from 'react-native';

var {
	View,
	Text,
	TouchableHighlight,
	NativeModules,
	StyleSheet
} = ReactNative;
import ReloginActivity from './re-login_activity';
const JMessageModule = NativeModules.JMessageModule;

class Me extends React.Component {

	constructor(props) {
		super(props);

		this.logout = this.logout.bind(this);
	}

	logout() {
		JMessageModule.logout((username) => {
			console.log('User has logged out ');
			this.props.navigator.replace({
				name: 'reloginActivity',
				component: ReloginActivity,
				params: {
					username: username
				}
			});
		});
	}

	render() {
		return (
			<View style = { styles.container }>
					<Text style = { styles.title }>
						Me Fragment
					</Text>
					<TouchableHighlight
						onPress = { this.logout }
						style = { styles.logoutBtn }>
						<Text style = { styles.btnText }>
							登出
						</Text>
					</TouchableHighlight>
				</View>
		);
	}
}

var styles = StyleSheet.create({
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

export default Me