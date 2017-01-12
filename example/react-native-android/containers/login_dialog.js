'use strict'

import React from 'react';
import ReactNative from 'react-native';
import JMessageModule from 'jmessage-react-plugin';

var {
	View,
	Text,
	Image,
	NativeModules,
	StyleSheet
} = ReactNative;

var LoginDialog = React.createClass({

	componentDidMount() {
		JMessageModule.loginWithoutDialog(this.props.username, this.props.password, () => {
			console.log('User login success');
			this.props.navigator.immediatelyResetRouteStack([{
				name: 'fillInfoActivity',
				params: {
					username: this.props.username,
				}
			}]);
		}, () => {
			this.props.navigator.pop();
		});
	},

	render() {
		return (
			<View style = { styles.container }>
				<View style = { styles.titlebar }>
					<Text style = { styles.title }>
						ReactJChat
					</Text>
				</View>
				<View style = { styles.content }>
					<Image style = { styles.headIcon }
						source = { {uri: 'head_icon'} }/>
					<Text style = { styles.hello }>
						Hello
					</Text>
					<Text style = { styles.waitAMonent }>
						稍等片刻!
					</Text>
				</View>
				<View style = { styles.bottomView }>
					<Image style = { styles.clock }
						source = { {uri: 'clock'} } />
				</View>	
			</View>

		);
	}
});

var styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	titlebar: {
		height: 40,
		backgroundColor: '#3f80dc',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 22,
		color: '#ffffff',
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	headIcon: {
		width: 100,
		height: 100,
		justifyContent: 'center',
	},
	hello: {
		marginTop: 20,
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: 24,
		color: '#555555'
	},
	waitAMonent: {
		marginTop: 10,
		fontSize: 24,
		color: '#555555',
		textAlign: 'center'
	},
	bottomView: {
		height: 50,
		alignItems: 'center',
		justifyContent: 'center'
	},
	clock: {
		width: 10,
		height: 10,
	}
});

module.exports = LoginDialog