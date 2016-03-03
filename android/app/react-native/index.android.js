'use strict';

var React = require('react-native');
var MainActivity = require('./main_activity');
var LoginActivity = require('./login_activity');
var RegisterActivity = require('./register_activity');
var ReloginActivity = require('./re-login_activity');
var FillInfoActivity = require('./fill_info_activity');
var LoginDialog = require('./login_dialog');
var {
  Text,
  TextInput,
  View,
  Navigator,
  TouchableHighlight,
  BackAndroid,
  NativeModules,
} = React;
var JMessageHelper = NativeModules.JMessageHelper;
var _navigator;
var MyAwesomeApp = React.createClass({
  
  configureScene(route) {
    return Navigator.SceneConfigs.FadeAndroid;
  },

  renderScene(router, navigator) {
    var Component = null;
    _navigator = navigator;
    switch(router.name) {
      case 'mainActivity':
        Component = MainActivity;
        break;
      case 'loginActivity':
        Component = LoginActivity;
        break;
      case 'registerActivity':
        Component = RegisterActivity;
        break;
      case 'reloginActivity':
        Component = ReloginActivity;
        break;
      case 'fillInfoActivity':
        Component = FillInfoActivity;
        break;
      case 'loginDialog':
        Component = LoginDialog;
        break;
    }

    //navigator作为props传递给了这个component,在Component中就可以直接拿到: props.navigator
    return <Component {...router.params} navigator = { navigator } />
},

  componentWillMount() {
    JMessageHelper.isLogin((map) => {
      switch (map.result) {
        case 're-login':
          _navigator.replace({
            name: 'reloginActivity',
            params: {
              username: map.username
            }
          });
          console.log('user has not logged in but cached userInfo');
          break;
        case 'login':
          _navigator.replace({
            name: 'loginActivity',
            params: {
              showBackBtn: false
            }
          });
          console.log('user has not logged in');
          break;
        case 'fillInfo':
          _navigator.replace({
            name: 'fillInfoActivity',
          });
          break;
        default:
          console.log('user has logged in');
          break;
      }
    });
  },

  componentDidMount() {
      var navigator = this._navigator;
      BackAndroid.addEventListener('hardwareBackPress', function() {
          if (navigator && navigator.getCurrentRoutes().length > 1) {
            navigator.pop();
            return true;
          }
          return false;
      });
  },

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress');
  },

    render() {
      return (
        <View style = { styles.container }>
          <Navigator
              initialRoute = { {name: 'mainActivity' }}
              configureScene = { this.configureScene }
              renderScene = { this.renderScene } />
        </View>

        );
    }
});


var styles = React.StyleSheet.create({

   container: {
    flex: 1,
    flexDirection: 'column'
  },
  actionbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0
  },
    buttonStyle: {
    marginTop: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#48bbec',
    borderRadius: 8,
    justifyContent:'center',
    alignSelf:'stretch',
    flexDirection: 'row',
    backgroundColor:'#48bbec'

  },
  buttonText: {    
    fontSize: 25,
    color: '#ffffff',
  }
});

React.AppRegistry.registerComponent('JChatApp', () => MyAwesomeApp);


