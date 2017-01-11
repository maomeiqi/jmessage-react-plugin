'use strict';

import React from 'react';
import ReactNative from 'react-native';

var {
  Text,
  TextInput,
  View,
  Navigator,
  TouchableHighlight,
  BackAndroid,
  NativeModules
} = ReactNative;
import {
  bindActionCreators
} from 'redux';
import {
  connect
} from 'react-redux';
import * as actions from '../actions';
import MainActivity from './main_activity';
import LoginActivity from './login_activity';
import RegisterActivity from './register_activity';
import ReloginActivity from './re-login_activity';
import FillInfoActivity from './fill_info_activity';
import LoginDialog from './login_dialog';
import CameraActivity from './camera';
import ChatActivity from './chat_activity';
import configureStore from '../store/configureStore';
var JMessageHelper = NativeModules.JMessageHelper;

var _navigator;
class BaseApp extends React.Component {

  constructor(props) {
    super(props);
    this.initialRoute = {
      name: 'mainActivity',
      component: MainActivity,
    }

    this.renderScene = this.renderScene.bind(this);
  }


  componentWillMount() {
    JMessageHelper.isLogin((map) => {
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
    return Navigator.SceneConfigs.VerticalDownSwipeJump;
  }

  renderScene(route, navigator) {
    _navigator = navigator;
    let Component = route.component;
    const {
      state,
      dispatch
    } = this.props;
    const action = bindActionCreators(actions, dispatch);
    //navigator作为props传递给了这个component,在Component中就可以直接拿到: props.navigator
    return <Component 
    				{...route.params}
    				state = { state }
    				actions = { action }
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

function mapSateToProps(state) {
  return {
    state: state
  }
}


export default connect(mapSateToProps)(BaseApp)