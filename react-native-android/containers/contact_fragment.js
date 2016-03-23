'use strict'

var React = require('react-native');
var {
	Component,
	View,
	Text,
} = React;

class Contact extends Component {
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

var styles = React.StyleSheet.create({
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