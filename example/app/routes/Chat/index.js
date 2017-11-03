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

var ReactNative = require('react-native');          

import IMUI from 'aurora-imui-react-native'
var InputView = IMUI.ChatInput;
var MessageListView = IMUI.MessageList;
const AuroraIController = IMUI.AuroraIMUIController;
const window = Dimensions.get('window');

import JMessage from 'jmessage-react-plugin';

import Translations from '../../resource/Translations'

var themsgid = 1

export default class Chat extends Component {

  static navigationOptions = {
    title: "Chat",
  };

  constructor(props) {
    super(props);
    this.state = { 
      inputViewLayout: {width:window.width, height:86,},
      menuContainerHeight: 1000,
      isDismissMenuContainer: false,
      shouldExpandMenuContainer: false,
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
        avatarPath: ""
    }
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
    console.log("from user: " + JSON.stringify(auroraMsg.fromUser))
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

  getNormalMessage () {
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

  componentDidMount() {  
    var parames = {

      'from': 0,            // 开始的消息下标。
      'limit': 10            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 条历史消息。
     }
    
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
          if (Platform.OS == 'ios') {
            AuroraIController.insertMessagesToTop(auroraMessages)
          } else {
            AuroraIController.insertMessagesToTop(auroraMessages)
          }
        }, (error) => {
          Alert.alert('error!', JSON.stringify(error))
        })

        this.receiveMessageCallBack = (message) => {
          
          if (this.conversation.conversationType === 'single') {
            if (message.target.type === 'user' ) {
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
  }

  componentWillUnmount() {
    JMessage.removeReceiveMessageListener(this.receiveMessageCallBack)
    AuroraIController.removeMessageListDidLoadListener(this.messageListDidLoadCallback)
    if (Platform.OS === 'android') {
      UIManager.dispatchViewManagerCommand(findNodeHandle(this.refs["MessageList"]), 1, null)  
    }
    
  }

  updateLayout(layout) {
    this.setState({inputViewLayout: layout})
  }

  onAvatarClick = (message) => {
      console.log(message)
    }

    onTouchMsgList() {
      console.log("Touch msg list, hidding soft input and dismiss menu");
      this.setState({
        isDismissMenuContainer: true,
        inputViewLayout: {
          width: Dimensions.get('window').width,
          height: 86
        },
        shouldExpandMenuContainer: false,
      });
    }

  onTouchEditText = () => {
    console.log("scroll to bottom")
    AuroraIController.scrollToBottom(true);
    if (this.state.shouldExpandMenuContainer) {
      this.setState({inputViewLayout: {width:window.width, height:420,}})
    }
    
  }

  onFullScreen = () => {
    this.setState({
      inputViewLayout: {width: window.width, height:window.height}
    })
  }

  onRecoverScreen = () => {
    this.setState({
      inputViewLayout: {width: window.width, height: 480}
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
      this.updateLayout({width:window.width, height:86,})
      AuroraIController.hidenFeatureView(true)
    }

  onPullToRefresh = () => {
      console.log("on pull to refresh")
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
      message.text = text
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
    for(index in mediaFiles) {
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
    this.updateLayout({width:window.width, height:338,})
  }

  onSwitchToGalleryMode = () => {
    this.updateLayout({width:window.width, height:338,})
  }

  onSwitchToCameraMode = () => {
    if (Platform.OS == "android") {
      this.updateLayout({width:window.width, height: 338})
      this.setState({
        shouldExpandMenuContainer: true
      })
    } else {
      this.updateLayout({width:window.width, height:338,})
    }
  }

  onShowKeyboard = (keyboard_height) => {
    var inputViewHeight = keyboard_height + 86
    this.updateLayout({width:window.width, height:inputViewHeight,})
  }

  onSwitchToEmojiMode = () => {
    if (Platform.OS == "android") {
      this.updateLayout({width:window.width, height: 338})
      this.setState({
        shouldExpandMenuContainer: true
      })
    } else {
      this.updateLayout({width:window.width, height:338,})
    }
  }

  onInitPress() {
      console.log('on click init push ');
      this.updateAction();
  }

  render() {
    return (
      <View style={styles.container}>
        <MessageListView style={styles.messageList}
        ref="MessageList"
        onAvatarClick={this.onAvatarClick}
        onMsgClick={this.onMsgClick}
        onStatusViewClick={this.onStatusViewClick}
        onTouchMsgList = {this.onTouchMsgList}
        onTapMessageCell={this.onTapMessageCell}
        onBeginDragMessageList={this.onBeginDragMessageList}
        onPullToRefresh={this.onPullToRefresh}
        avatarSize={{width:40,height:40}}
        sendBubbleTextSize={18}
        sendBubbleTextColor={"#000000"}
        sendBubblePadding={{left:10,top:10,right:15,bottom:10}}
        />
        <InputView style={this.state.inputViewLayout}
        menuContainerHeight = {this.state.menuContainerHeight}
				isDismissMenuContainer = {this.state.isDismissMenuContainer}
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
  messageList: {
    flex: 1,
    marginTop: 0,
    width: window.width,
    margin:0,
  },
  inputView: {
    backgroundColor: 'green',
    width: window.width,
    height:100,
    
  },
  btnStyle: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3e83d7',
    borderRadius: 8,
    backgroundColor: '#3e83d7'
  }
});

