'use strict'

import React from 'react';
import ReactNative from 'react-native';

var {
	Animated,
    Dimensions,
	View,
	Text,
	Image,
	TouchableHighlight,
    TouchableWithoutFeedback,
	StyleSheet,
} = ReactNative;
import ChatBg from './ChatBg';
var window = Dimensions.get('window');

export default class ReceiveTextCell extends React.Component {

	constructor(props) {
		super(props);
        this.state = {
            bgWidth: window.width / 3 * 2,
            bgHeight: 50,
        }
	}

    _onLayout = (event) => {
        this.setState({
            bgHeight: event.nativeEvent.layout.height,
            bgWidth: event.nativeEvent.layout.width,
        });
    };

	render() {
		const {
			avatar,
			content,
			date
		} = this.props;
		const {bgWidth, bgHeight} = this.state;
		var icon;
		if (avatar === undefined || avatar === "") {
			icon = {
				uri: 'jmui_head_icon'
			}
		} else {
			icon = {
				uri: avatar
			}
		}
		return (
			<View style = { styles.container }>
				<View style = { styles.dateContainer }>
					<Text style = { styles.date }>
						{date}
					</Text>
				</View>
				<View style = { styles.content }>
					<Image style = { styles.avatar }
						source = {icon}/>
					<TouchableWithoutFeedback
						onLayout={this._onLayout}
					>
						<View>
							<ChatBg
								width={bgWidth}
								height={bgHeight}
								isMe={false}
							/>
							<Text
                                style={styles.textContent}
                                ref={v => this.leftText = v}
                            >
                                {content}
							</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</View>
		);
	}
}

var styles = StyleSheet.create({
	container: {
		flex: 1,
        paddingBottom: 10,
	},
	dateContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 2,
		paddingBottom: 2,
	},
	date: {
		textAlign: 'center',
		fontSize: 12,
		color: '#555756',
	},
	content: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	textBg: {
		flex: 1,
		marginLeft: 20,
		alignItems: 'flex-start',
	},
	textContent: {
        position: 'absolute',
        left: 20,
        top: 10,
		color: '#373334',
		fontSize: 18,
	},
	avatar: {
		marginRight: 5,
		width: 50,
		height: 50,
	}
});