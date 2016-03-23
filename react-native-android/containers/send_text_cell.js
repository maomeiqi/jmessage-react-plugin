'use strict'

var React = require('react-native');
var {
	Animated,
	View,
	Text,
	Image,
	TouchableHighlight,
} = React;

var SendTextCell = React.createClass({

	render() {
		return (
			<View style = { styles.container }>
				<View style = { styles.dateContainer }>
					<Text style = { styles.date }>
						下午 13:48
					</Text>
				</View>
				<View style = { styles.content }>
					<Animated.Image style = { styles.sendingIcon }
						source = { {uri: 'sending_img'}}>
					</Animated.Image>
					<Image style = { styles.textBg }
						source = { {uri: 'send_msg'}}>
						<Text style = { styles.textContent }>
							this is a Text
						</Text>
					</Image>
					<Image style = { styles.avatar }
						source = { {uri: 'head_icon'}}/>
				</View>
			</View>
		);
	}
});

var styles = React.StyleSheet.create({
	container: {
		flex: 1,
	},
	dateContainer: {
		alignItems: 'center', 
		justifyContent: 'center', 
		marginTop: 5,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 2,
		paddingBottom: 2,
		backgroundColor: '#555756',
	},
	date: {
		textAlign: 'center',
		fontSize: 12,
		color: '#555756',
	},
	content: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	sendingIcon: {
		width: 10,
		height: 10,
	},
	textBg: {
		flex: 1,
		marginLeft: 20,
		alignItems: 'flex-start',
	},
	textContent: {
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 5,
		paddingBottom: 5,
		color: '#373334',
		fontSize: 18,
	},
	avatar: {
		marginRight: 5,
		width: 50,
		height: 50,
	}
});

module.exports = SendTextCell;