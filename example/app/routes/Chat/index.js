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
  DeviceEventEmitter
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
  constructor(props) {
    super(props);
    this.state = { inputViewLayout: {width:window.width, height:86,}};
    
    this.updateLayout = this.updateLayout.bind(this);
    this.conversation = this.props.navigation.state.params.conversation

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
      // auroraMsg.text = "jmessage.text"
    }
  
    if (jmessage.type === 'image') {    
      auroraMsg.mediaPath = jmessage.thumbPath
    }
  
    if (jmessage.type === 'voice') {    
      auroraMsg.mediaPath = jmessage.path
      auroraMsg.duration = jmessage.duration
    }
  
    var user = {
        userId: "",
        displayName: "",
        avatarPath: ""
    }
    user.userId = jmessage.from.username
    user.displayName = jmessage.from.nickname
    user.avatarPath = jmessage.from.avatarThumbPath
    auroraMsg.fromUser = user
    auroraMsg.status = "send_going"

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
    // Alert.alert(this.props.navigation.state.params.key)

    var parames = {

      'from': 0,            // 开始的消息下标。
      'limit': 10            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 条历史消息。
     }
    //  Alert.alert('conversation', this.conversation)
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
            if (message.target.type === 'user' ) {
              if (message.from.username === this.conversation.key) {
                var msg = this.convertJMessageToAuroraMsg(message)
                AuroraIController.appendMessages([msg])
              }
              Alert.alert('message.target.username', message.target.username)
              Alert.alert('this.conversation.key', this.conversation.key)
              // Alert.alert("1111:", JSON.stringify(message)) 
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
    Alert.alert("Component", "will unmount")
    JMessage.removeReceiveMessageListener(this.receiveMessageCallBack)
    AuroraIController.removeMessageListDidLoadListener(this.messageListDidLoadCallback)
  }

  updateLayout(layout) {
    this.setState({inputViewLayout: layout})
  }

  onAvatarClick = (message) => {
      console.log(message)
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
    JMessage.sendTextMessage(message, (message) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(message)
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)
    }, (error) => {
      Alert.alert(JSON.stringify(error))
    })
  }

  onTakePicture = (mediaPath) => {
    var message = this.getNormalMessage()
    message.path = mediaPath
    message.messageType = "image"
    JMessage.createSendMessage(message, (message) => {
      Alert.alert("the message:", JSON.stringify(message))
      // {
      //   *  'id': Number,                                  // message id
      //   *  'type': String,                                // 'single' / 'group'
      //   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
      //   *  'username': String,                            // 当 type = single 时，username 不能为空
      //   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
      //   *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
      //   * }
      var msg = {}
      msg.id = message.id
      console.log(JSON.stringify(message))
      // msg.type = message.target.type
      if (message.target.type === 'user') {
        msg.username = message.target.username
        msg.type = 'single'
      } else {
        msg.groupId = message.target.id
        msg.type = 'group'
      }

      JMessage.sendMessage(msg,(message) => {

      },(error) => {

      },(progress) => {
        // console.log("" + progress)
      })
    })
    // JMessage.sendImageMessage(message, (message) => {
    //   var auroraMsg = this.convertJMessageToAuroraMsg(message)
    //   AuroraIController.appendMessages([auroraMsg])
    //   AuroraIController.scrollToBottom(true)
    // }, (error) => {
    //   Alert.alert(JSON.stringify(error))
    // })

  }

  onStartRecordVoice = (e) => {
    console.log("on start record voice")
  }

  onFinishRecordVoice = (mediaPath, duration) => {

    var message = this.getNormalMessage()
    message.path = mediaPath
    JMessage.sendVoiceMessage(message, (message) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(message)
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)
    }, (error) => {
      Alert.alert(JSON.stringify(error))
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
    message.path = mediaPath
    message.extras = {type: "video"}
    message.fileName = "video"
    JMessage.sendFileMessage(message, (message) => {
      var auroraMsg = this.convertJMessageToAuroraMsg(message)
      AuroraIController.appendMessages([auroraMsg])
      AuroraIController.scrollToBottom(true)
    }, (error) => {
      Alert.alert(JSON.stringify(error))
    })
  }
    
  onSendGalleryFiles = (mediaFiles) => {
    

    /**
     * WARN: 这里返回的是原图，直接插入大会话列表会很大且耗内存.
     * 应该做裁剪操作后再插入到 messageListView 中，
     * 一般的 IM SDK 会提供裁剪操作，或者开发者手动进行裁剪。
     * 
     * 代码用例不做裁剪操作。
     */ 
    for(index in mediaFiles) {
      var message = this.getNormalMessage()
      message.path = mediaFiles[index].mediaPath
      JMessage.sendImageMessage(message, (message) => {
        var auroraMsg = this.convertJMessageToAuroraMsg(message)
        AuroraIController.appendMessages([auroraMsg])
        AuroraIController.scrollToBottom(true)
      }, (error) => {
        Alert.alert(JSON.stringify(error))
      })
    }
  }

  onSwitchToMicrophoneMode = () => {
    this.updateLayout({width:window.width, height:256,})
  }

  onSwitchToGalleryMode = () => {
    this.updateLayout({width:window.width, height:256,})
  }

  onSwitchToCameraMode = () => {
    this.updateLayout({width:window.width, height:256,})
  }

  onShowKeyboard = (keyboard_height) => {
    var inputViewHeight = keyboard_height + 86
    this.updateLayout({width:window.width, height:inputViewHeight,})
  }


  onInitPress() {
      console.log('on click init push ');
      this.updateAction();
  }

  render() {
    return (
      <View style={styles.container}>
        <MessageListView style={styles.messageList}
        onAvatarClick={this.onAvatarClick}
        onMsgClick={this.onMsgClick}
        onStatusViewClick={this.onStatusViewClick}
        onTapMessageCell={this.onTapMessageCell}
        onBeginDragMessageList={this.onBeginDragMessageList}
        onPullToRefresh={this.onPullToRefresh}
        avatarSize={{width:40,height:40}}
        sendBubbleTextSize={18}
        sendBubbleTextColor={"000000"}
        sendBubblePadding={{left:10,top:10,right:10,bottom:10}}
        />
        <InputView style={this.state.inputViewLayout}
        onSendText={this.onSendText}
        onTakePicture={this.onTakePicture}
        onStartRecordVoice={this.onStartRecordVoice}
        onFinishRecordVoice={this.onFinishRecordVoice}
        onCancelRecordVoice={this.onCancelRecordVoice}
        onStartRecordVideo={this.onStartRecordVideo}
        onFinishRecordVideo={this.onFinishRecordVideo}
        onSendGalleryFiles={this.onSendGalleryFiles}
        onSwitchToMicrophoneMode={this.onSwitchToMicrophoneMode}
        onSwitchToGalleryMode={this.onSwitchToGalleryMode}
        onSwitchToCameraMode={this.onSwitchToCameraMode}
        onShowKeyboard={this.onShowKeyboard}
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
    backgroundColor: 'red',
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

