// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  * @flow
//  */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeModules,
  requireNativeComponent,
  Alert,
  Dimensions,
  DeviceEventEmitter,
  Platform,
  UIManager,
  findNodeHandle,
} from 'react-native';

import IMUI from 'aurora-imui-react-native'
var InputView = IMUI.ChatInput;
var MessageListView = IMUI.MessageList;
const AuroraIController = IMUI.AuroraIMUIController;
const window = Dimensions.get('window');

import JMessage from 'jmessage-react-plugin';

import Translations from '../../resource/Translations'

var themsgid = 1
var from = 0;
var limit = 10;

export default class Chat extends Component {

  static navigationOptions = {
    title: "Chat",
  };

  constructor(props) {
    super(props);
    let initHeight;
    if (Platform.OS == "android") {
      initHeight = 100
    } else {
      initHeight = 86
    }
    this.state = {
      inputLayoutHeight: initHeight,
      messageListLayout: {},
      inputViewLayout: { width: window.width, height: initHeight, },
    };

    this.updateLayout = this.updateLayout.bind(this);
    this.onTouchMsgList = this.onTouchMsgList.bind(this);
    this.conversation = this.props.navigation.state.params.conversation
    console.log(JSON.stringify(this.conversation))
    // Alert.alert("the conversation ",JSON.stringify(this.conversation))
    JMessage.getMyInfo((myInfo) => {
      this.myInfo = myInfo
    })
  }

  convertJMessageToAuroraMsg(jmessage) {
    var auroraMsg = {}
    auroraMsg.msgType = jmessage.type
    auroraMsg.msgId = jmessage.id

    if (jmessage.type === 'text') {
      auroraMsg.text = jmessage.text
    }

    if (jmessage.type === 'image') {
      auroraMsg.mediaPath = jmessage.thumbPath
    }

    if (jmessage.type === 'voice') {
      auroraMsg.mediaPath = jmessage.path
      auroraMsg.duration = jmessage.duration
    }

    if (jmessage.type === 'file') {
      auroraMsg.mediaPath = jmessage.path
      auroraMsg.duration = jmessage.duration
      auroraMsg.msgType = "video"
    }

    var user = {
      userId: "1",
      displayName: "",
      avatarPath: "1111111"
    }
    console.log("from user: " + jmessage.from.avatarThumbPath)
    user.userId = jmessage.from.username
    user.displayName = jmessage.from.nickname
    user.avatarPath = jmessage.from.avatarThumbPath
    if (user.displayName == "") {
      user.displayName = jmessage.from.username
    }
    if (user.avatarPath == "") {
      user.avatarPath = "ironman"
    }
    auroraMsg.fromUser = user
    console.log("from user11111: " + JSON.stringify(auroraMsg.fromUser))
    auroraMsg.status = "send_succeed"

    auroraMsg.isOutgoing = true

    if (this.myInfo.username === jmessage.from.username) {
      auroraMsg.isOutgoing = true
    } else {
      auroraMsg.isOutgoing = false
    }

    auroraMsg.timeString = ""

    return auroraMsg
  }

  getNormalMessage() {
    var message = {}

    if (this.conversation.conversationType === 'single') {
      message.type = 'single'
      message.username = this.conversation.key
    } else {
      message.type = 'group'
      message.groupId = this.conversation.key
    }
    return message
  }

  sendCustomMessage = () => {
    var messages = [];
    for (var i = 0; i < 10; i++) {
      var message = this.getNormalMessage()
      message.msgType = "custom"
      message.msgId = "10"
      message.status = "send_going"
      message.isOutgoing = true
      message.content = '<body bgcolor="#ff3399"><h5>This is a custom message. </h5>\
      <img src="/storage/emulated/0/XhsEmoticonsKeyboard/Emoticons/wxemoticons/icon_040_cover.png"></img></body>'
      message.contentSize = { 'height': 200, 'width': 200 }
      message.extras = { "extras": "fdfsf" }
      var user = {
        userId: "1",
        displayName: "",
        avatarPath: ""
      }
      user.displayName = "0001"
      user.avatarPath = "ironman"
      message.fromUser = user
      messages[i] = message;
    }

    AuroraIController.appendMessages(messages);

  }

  componentDidMount() {
    this.resetMenu()
    var parames = {

      'from': 0,            // 开始的消息下标。
      'limit': 10            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 条历史消息。
    }
    this.setState({
      messageListLayout: { flex: 1, margin: 0, width: window.width }
    })
    if (this.conversation.conversationType === 'single') {
      parames.type = 'single'
      parames.username = this.conversation.key
    } else {
      parames.type = 'group'
      parames.groupId = this.conversation.key
    }
    this.messageListDidLoadCallback = () => {

      JMessage.getHistoryMessages(parames, (messages) => {
        var auroraMessages = messages.map((message) => {
          var normalMessage = this.convertJMessageToAuroraMsg(message)
          if (normalMessage.msgType === "unknow") {
            return
          }
          return normalMessage
        })
        AuroraIController.insertMessagesToTop(auroraMessages)
      }, (error) => {
        Alert.alert('error!', JSON.stringify(error))
      })

      this.receiveMessageCallBack = (message) => {

        if (this.conversation.conversationType === 'single') {
          if (message.target.type === 'user') {
            if (message.from.username === this.conversation.key) {
              var msg = this.convertJMessageToAuroraMsg(message)
              AuroraIController.appendMessages([msg])
            }
            Alert.alert('message.target.username', message.target.username)
            Alert.alert('this.conversation.key', this.conversation.key)
          }
        } else {
          if (message.target.type === 'group') {
            if (message.from.id === this.conversation.key) {
              var msg = this.convertJMessageToAuroraMsg(message)
              AuroraIController.appendMessages([msg])
            }
          }
        }
      }
      JMessage.addReceiveMessageListener(this.receiveMessageCallBack)
    }
    AuroraIController.addMessageListDidLoadListener(this.messageListDidLoadCallback)
    this.timer = setTimeout(() => {
      console.log("Sending custom message")
      this.sendCustomMessage();
    }, 2000)
  }

  onInputViewSizeChange = (size) => {
    console.log("height: " + size.height)
    if (this.state.inputLayoutHeight != size.height) {
      this.setState({
        inputLayoutHeight: size.height,
        inputViewLayout: { width: size.width, height: size.height }
      })
    }
  }

  componentWillUnmount() {
    JMessage.removeReceiveMessageListener(this.receiveMessageCallBack)
    AuroraIController.removeMessageListDidLoadListener(this.messageListDidLoadCallback)
    this.timer && clearTimeout(this.timer);

  }

  resetMenu() {
    if (Platform.OS === "android") {
      this.refs["ChatInput"].showMenu(false)
    } else {
      this.setState({
        inputViewLayout: { width: window.width, height: 86 }
      })
    }
  }

  updateLayout(layout) {
    this.setState({ inputViewLayout: layout })
  }

  onAvatarClick = (message) => {
    console.log(message)
  }

  onTouchMsgList() {
    AuroraIController.hidenFeatureView(true)
  }

  onTouchEditText = () => {
    console.log("scroll to bottom")
    AuroraIController.scrollToBottom(true);
    // this.refs["ChatInput"].showMenu(false)
    this.setState({
      inputViewLayout: { width: window.width, height: this.state.inputLayoutHeight }
    })
  }

  onFullScreen = () => {
    var navigationBar = 50
    this.setState({
      messageListLayout: { flex: 0, width: 0, height: 0 },
      inputViewLayout: { flex:1, width: window.width, height: window.height }
    })
  }

  onRecoverScreen = () => {
    this.setState({
      messageListLayout: { flex: 1, width: window.width, margin: 0 },
      inputViewLayout: { flex: 0, width: window.width, height: this.state.inputLayoutHeight}
    })
  }

  onMsgClick = (message) => {
    console.log(message)
  }

  onStatusViewClick = (message) => {
    console.log(message)
    message.status = 'send_succeed'
    message.fromUser.avatarPath = message.mediaPath
    AuroraIController.updateMessage(message)
  }

  onBeginDragMessageList = () => {
    this.updateLayout({ width: window.width, height: 86, })
    AuroraIController.hidenFeatureView(true)
  }

  onPullToRefresh = () => {
    console.log("on pull to refresh")
    // After loading history messages
    if (Platform.OS === "android") {
      this.timer = setTimeout(() => {
        console.log("send refresh complete event")
        this.refs["MessageList"].refreshComplete()
      }, 2000);
    }
  }

  onSendText = (text) => {

    var message = this.getNormalMessage()
    message.text = text
    message.messageType = "text"

    JMessage.createSendMessage(message, (msg) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(msg)
      auroraMsg.status = 'send_going'
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)

      if (this.conversation.conversationType === 'single') {
        msg.type = 'single'
        msg.username = this.conversation.key
      } else {
        msg.type = 'group'
        msg.groupId = this.conversation.key
      }

      JMessage.sendMessage(msg, (jmessage) => {

        var auroraMsg = this.convertJMessageToAuroraMsg(jmessage)
        AuroraIController.updateMessage(auroraMsg)
      }, (error) => {
      })
    })
  }

  onTakePicture = (mediaPath) => {
    var message = this.getNormalMessage()
    message.messageType = "image"
    message.path = mediaPath

    JMessage.createSendMessage(message, (msg) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(msg)
      auroraMsg.status = 'send_going'
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)

      if (this.conversation.conversationType === 'single') {
        msg.type = 'single'
        msg.username = this.conversation.key
      } else {
        msg.type = 'group'
        msg.groupId = this.conversation.key
      }

      JMessage.sendMessage(msg, (jmessage) => {
        var auroraMsg = this.convertJMessageToAuroraMsg(jmessage)
        AuroraIController.updateMessage(auroraMsg)
      }, (error) => {
        Alert.alert('send image fail')
      })
    })

  }

  onStartRecordVoice = (e) => {
    console.log("on start record voice")
  }

  onFinishRecordVoice = (mediaPath, duration) => {
    var message = this.getNormalMessage()
    message.messageType = "voice"
    message.path = mediaPath

    JMessage.createSendMessage(message, (msg) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(msg)
      auroraMsg.status = 'send_going'
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)

      if (this.conversation.conversationType === 'single') {
        msg.type = 'single'
        msg.username = this.conversation.key
      } else {
        msg.type = 'group'
        msg.groupId = this.conversation.key
      }

      JMessage.sendMessage(msg, (jmessage) => {
        var auroraMsg = this.convertJMessageToAuroraMsg(jmessage)
        AuroraIController.updateMessage(auroraMsg)
      }, (error) => {
        Alert.alert('send image fail')
      })
    })
  }

  onCancelRecordVoice = () => {
    console.log("on cancel record voice")
  }

  onStartRecordVideo = () => {
    console.log("on start record video")
  }

  onFinishRecordVideo = (mediaPath) => {
    var message = this.getNormalMessage()
    message.messageType = "file"
    message.path = mediaPath

    JMessage.createSendMessage(message, (msg) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(msg)
      auroraMsg.status = 'send_going'
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)

      if (this.conversation.conversationType === 'single') {
        msg.type = 'single'
        msg.username = this.conversation.key
      } else {
        msg.type = 'group'
        msg.groupId = this.conversation.key
      }

      JMessage.sendMessage(msg, (jmessage) => {
        var auroraMsg = this.convertJMessageToAuroraMsg(jmessage)
        AuroraIController.updateMessage(auroraMsg)
      }, (error) => {
        Alert.alert('send image fail')
      })
    })
  }

  onSendGalleryFiles = (mediaFiles) => {
    for (index in mediaFiles) {
      var message = this.getNormalMessage()
      message.messageType = "image"
      message.path = mediaFiles[index].mediaPath

      JMessage.createSendMessage(message, (msg) => {
        var auroraMsg = this.convertJMessageToAuroraMsg(msg)
        auroraMsg.status = 'send_going'
        AuroraIController.appendMessages([auroraMsg])
        AuroraIController.scrollToBottom(true)

        if (this.conversation.conversationType === 'single') {
          msg.type = 'single'
          msg.username = this.conversation.key
        } else {
          msg.type = 'group'
          msg.groupId = this.conversation.key
        }

        JMessage.sendMessage(msg, (jmessage) => {
          var auroraMsg = this.convertJMessageToAuroraMsg(jmessage)
          AuroraIController.updateMessage(auroraMsg)
        }, (error) => {
          Alert.alert('send image fail')
        })
      })
    }
  }

  onSwitchToMicrophoneMode = () => {
    AuroraIController.scrollToBottom(true)
  }

  onSwitchToGalleryMode = () => {
    AuroraIController.scrollToBottom(true)
  }

  onSwitchToCameraMode = () => {
    AuroraIController.scrollToBottom(true)
  }

  onShowKeyboard = (keyboard_height) => {
    var inputViewHeight = keyboard_height + 86
    this.updateLayout({ width: window.width, height: inputViewHeight, })
  }

  onSwitchToEmojiMode = () => {
    AuroraIController.scrollToBottom(true)
  }

  onInitPress() {
    console.log('on click init push ');
    this.updateAction();
  }

  render() {
    return (
      <View style={styles.container}>
        <MessageListView style={this.state.messageListLayout}
          ref="MessageList"
          onAvatarClick={this.onAvatarClick}
          onMsgClick={this.onMsgClick}
          onStatusViewClick={this.onStatusViewClick}
          onTouchMsgList={this.onTouchMsgList}
          onTapMessageCell={this.onTapMessageCell}
          onBeginDragMessageList={this.onBeginDragMessageList}
          onPullToRefresh={this.onPullToRefresh}
          avatarSize={{ width: 40, height: 40 }}
          sendBubbleTextSize={18}
          sendBubbleTextColor={"#000000"}
          sendBubblePadding={{ left: 10, top: 10, right: 15, bottom: 10 }}
        />
        <InputView style={this.state.inputViewLayout}
          ref="ChatInput"
          menuContainerHeight={this.state.menuContainerHeight}
          isDismissMenuContainer={this.state.isDismissMenuContainer}
          onSendText={this.onSendText}
          onTakePicture={this.onTakePicture}
          onStartRecordVoice={this.onStartRecordVoice}
          onFinishRecordVoice={this.onFinishRecordVoice}
          onCancelRecordVoice={this.onCancelRecordVoice}
          onStartRecordVideo={this.onStartRecordVideo}
          onFinishRecordVideo={this.onFinishRecordVideo}
          onSendGalleryFiles={this.onSendGalleryFiles}
          onSwitchToEmojiMode={this.onSwitchToEmojiMode}
          onSwitchToMicrophoneMode={this.onSwitchToMicrophoneMode}
          onSwitchToGalleryMode={this.onSwitchToGalleryMode}
          onSwitchToCameraMode={this.onSwitchToCameraMode}
          onShowKeyboard={this.onShowKeyboard}
          onTouchEditText={this.onTouchEditText}
          onFullScreen={this.onFullScreen}
          onRecoverScreen={this.onRecoverScreen}
          onSizeChanged={this.onInputViewSizeChange}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  inputView: {
    backgroundColor: 'green',
    width: window.width,
    height: 100,

  },
  btnStyle: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3e83d7',
    borderRadius: 8,
    backgroundColor: '#3e83d7'
  }
});

