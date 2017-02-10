'use strict';

import React from 'react';
import ReactNative from 'react-native';

var {
  Text,
  TextInput,
  View,
  Navigator,
  NativeModules,
  TouchableHighlight,
  BackAndroid,
  AppRegistry
} = ReactNative;

const JMessageModule = NativeModules.JMessageModule;
import MainActivity from './react-native-android/main_activity';
import LoginActivity from './react-native-android/login_activity';
import RegisterActivity from './react-native-android/register_activity';
import ReloginActivity from './react-native-android/re-login_activity';
import LoginDialog from './react-native-android/login_dialog';
import FillInfoActivity from './react-native-android/fill_info_activity';
var _navigator;
class JChatDemo extends React.Component {

  constructor(props) {
    super(props);
    this.initialRoute = {
      name: 'mainActivity',
      component: MainActivity,
    }

    this.renderScene = this.renderScene.bind(this);
  }


  componentWillMount() {
    JMessageModule.init(1);
    JMessageModule.isLogin((map) => {
      switch (map.result) {
        case 're-login':
          _navigator.replace({
            name: 'reloginActivity',
            component: ReloginActivity,
            params: {
              username: map.username
            }
          });
          console.log('user has not logged in but cached userInfo');
          break;
        case 'login':
          _navigator.replace({
            name: 'loginActivity',
            component: LoginActivity,
            params: {
              showBackBtn: false
            }
          });
          console.log('user has not logged in');
          break;
        case 'fillInfo':
          _navigator.replace({
            name: 'fillInfoActivity',
            component: FillInfoActivity,
          });
          break;
        default:
          console.log('user has logged in');
          break;
      }
    });

  }

  componentDidMount() {}

  componentWillUnmount() {}


  configureScene() {
    return Navigator.SceneConfigs.FloatFromRight;
  }

  renderScene(route, navigator) {
    _navigator = navigator;
    let Component = route.component;
    //navigator作为props传递给了这个component,在Component中就可以直接拿到: props.navigator
    return <Component 
            {...route.params}
            navigator = { navigator }
          />
  }

  render() {
    return (
      <Navigator
        initialRoute = { this.initialRoute }
        configureScene = { this.configureScene }
        renderScene = { this.renderScene }
      />

    );
  }
}

AppRegistry.registerComponent('TestReactJChat', () => JChatDemo);