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
import MainActivity from './pages/main_activity';
import LoginActivity from './pages/login_activity';
import RegisterActivity from './pages/register_activity';
import ReloginActivity from './pages/re-login_activity';
import LoginDialog from './pages/login_dialog';
import FillInfoActivity from './pages/fill_info_activity';
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
        JMessageModule.getMyInfo((userInfo) => {
            var output = "";
            for (var i in userInfo) {
                var property = userInfo[i];
                output += i + " = " + property + "\n";
            }
            console.log(output);
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