'use strict';

import React from 'react';
import ReactNative from 'react-native';

var {
    PropTypes
} = React;
var {
    Animated,
    Easing,
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

export default class SendTextCell extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            rotate: new Animated.Value(0),
            bgWidth: window.width / 3 * 2,
            bgHeight: 50,
            opacity: 0,
        };

        this.startAnimation = this.startAnimation.bind(this);
        this.resendMsg = this.resendMsg.bind(this);
    }

    setNativeProps(props) {
        this._root.setNativeProps(props);
    }

    componentDidMount() {
        this.startAnimation();
    }

    startAnimation() {
        if (this.props.sendState === "sending") {
            console.log("sending");
            this.state.rotate.setValue(0);
            Animated.timing(this.state.rotate, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear
            }).start(() => this.startAnimation());
        } else if (this.props.sendState === "sendSuccess") {
            console.log("send succeed");
            this.setState({
                showSending: false,
                showResend: false,
            });
        } else {
            console.log("send failed");
            this.setState({
                showSending: false,
                showResend: true
            });
        }
    }

    // onLongPress = () => {
    // 	const {
    // 		content,
    // 	} = this.props;
    // 	this._root.measureInWindow((x, y, width, height) => {
    // 		longPress({
    // 			x: x,
    // 			y: y,
    // 			width: width,
    // 			height: height
    // 		}, content)

    // 	})
    // }
    _onLayout = (event) => {
        this.setState({
            bgHeight: event.nativeEvent.layout.height,
            bgWidth: event.nativeEvent.layout.width,
        });
    };


    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.sendState !== nextProps.sendState) {
            return true;
        }
        return false;
    }

    resendMsg() {
        console.log("resending message");
    }

    render() {
        const {
            avatar,
            date,
            content,
            sendState,
            key,
        } = this.props;
        const {
            bgWidth,
            bgHeight,
            opacity,
        } = this.state;
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
            <View style={ styles.container }>
                <View style={ styles.dateContainer }>
                    <Text style={ styles.date }>
                        {date}
                    </Text>
                </View>
                <View style={ styles.content }>
                    {sendState === "sending" ?
                        <Animated.Image style={ styles.sendingIcon }
                                        source={{uri: 'sending_img'}}>
                        </Animated.Image> : null}
                    {sendState === "sendFailed" ?
                        <TouchableOpacity
                            onPress={this.resendMsg}>
                            <Image style={ styles.sendingIcon }
                                   source={ {uri: 'send_error'}}/>
                        </TouchableOpacity> : null}
                    <TouchableWithoutFeedback
                        onLayout={this._onLayout}
                    >
                        <View>
                            <ChatBg
                                width={bgWidth}
                                height={bgHeight}
                                isMe={true}
                            />
                            <Text style={styles.textContent}>
                                {content}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <Image style={ styles.avatar }
                           source={icon}/>
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
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    sendingIcon: {
        width: 20,
        height: 20,
    },
    textBg: {
        marginLeft: 5,
        alignItems: 'flex-start',
        width: 260,
        height: 50,
    },
    textContent: {
        position: 'absolute',
        left: 10,
        top: 10,
        color: '#373334',
        fontSize: 16,
    },
    avatar: {
        marginRight: 5,
        width: 50,
        height: 50,
    }
});