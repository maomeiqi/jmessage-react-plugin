'use strict'

import React from 'react';
import ReactNative from 'react-native';

var {
	View,
	Text,
	StyleSheet
} = ReactNative;

class Contact extends React.Component {
	render() {
		return (
			<View style = { styles.container }>
					<Text style = { styles.title }>
						Contact Fragment
					</Text>
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
		color: '#83f302'
	}
});

export default Contact