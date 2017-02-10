'use strict'

import React from 'react';
import ReactNative from 'react-native';
import Conv from './conv_fragment';
import Contact from './contact_fragment';
import Me from './me_fragment';
var {
    BackAndroid,
    Text,
    View,
    Image,
    TouchableHighlight,
    TouchableNativeFeedback,
    Navigator,
    NativeModules,
    Platform,
    ViewPagerAndroid,
    StyleSheet
} = ReactNative;

var JMessageModule = NativeModules.JMessageModule;

class Actionbar extends React.Component {

    isActive(index) {
        return this.props.currentPage == index;
    }

    onPageSelected(index) {
        this.props.onselect(index);
    }

    render() {
        var TouchableElement = TouchableHighlight;
        if (Platform.OS === 'android') {
            TouchableElement = TouchableNativeFeedback;
        };
        var icon1 = this.isActive(0) ? {
            uri: 'actionbar_msg_sel'
        } : {
            uri: 'actionbar_msg'
        };
        var icon2 = this.isActive(1) ? {
            uri: 'actionbar_contact_sel'
        } : {
            uri: 'actionbar_contact'
        };
        var icon3 = this.isActive(2) ? {
            uri: 'actionbar_me_sel'
        } : {
            uri: 'actionbar_me'
        };
        return (
            <View >
				    <View style = { styles.actionbarContainer }>
						<TouchableElement
							onPress = { () => this.onPageSelected(0) }>
							<View style = { styles.actionItem }>
								<Image 
                                    style = { styles.actionbarIcon }
									source = {icon1}
                                />
								<Text style = { [styles.actionText, this.isActive(0) ? styles.actionActive : '']}>
									聊天
								</Text>
                            </View>
						</TouchableElement>
						<TouchableElement
							onPress  = { () => this.onPageSelected(1) }>
							<View style = { styles.actionItem }>
									<Image 
                                        style = { styles.actionbarIcon }
										source = {icon2}
                                    />
								<View>
									<Text style = { [styles.actionText, this.isActive(1) ? styles.actionActive : '']}>
										通讯录
									</Text>
								</View>
							</View> 
                        </TouchableElement>
                        < TouchableElement onPress = {() => this.onPageSelected(2)} >
                            <View style = { styles.actionItem }>
					           <Image 
                                    style = { styles.actionbarIcon }
									source = {icon3}
                                />
								<View>
									<Text style = {[styles.actionText,  this.isActive(2) ? styles.actionActive : '']}>
										我
									</Text>
								</View>
							</View> 
                            </TouchableElement> 
                </View >
                </View>

        );
    }
}


export default class MainActivity extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            page: 0,
        };

        this.onSelectMenu = this.onSelectMenu.bind(this);
        this.onPageSelected = this.onPageSelected.bind(this);
    }

    onPageSelected(e) {
        console.log('Page selected!');
        this.setState({
            page: e.nativeEvent.position
        });
    }

    componentDidMount() {
        var navigator = this.props.navigator;

        BackAndroid.addEventListener('hardwareBackPress', () => {
            console.log('MainActivity backPressed');
            if (navigator && navigator.getCurrentRoutes() > 0) {
                navigator.pop();
                return true;
            }
            return false;
        });
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
    }

    onSelectMenu(index) {
        if (index != this.state.page) {
            this.viewPager.setPage(index);
            this.setState({
                page: index
            });
        };
    }

    render() {
        var pages = [];
        var pageStyle = {
            flex: 1
        };
        pages.push(
            <View key = { 0 } style = { pageStyle } collapsable = { true }>
                <Conv
                    state = { this.props.state }
                    navigator = { this.props.navigator }
                />
            </View>
        );
        pages.push(
            <View key = { 1 } style = { pageStyle } collapsable = { true }>
                <Contact navigator = { this.props.navigator }/>
            </View>
        );
        pages.push(
            <View key = { 2 } style = { pageStyle } collapsable = { true }>
                <Me navigator = { this.props.navigator } />
            </View>
        );
        return (
            <View style = { styles.container }>
					<ViewPagerAndroid
						style = { styles.viewPager }
						initialPage = {0}
						onPageSelected = { this.onPageSelected }
						ref = { viewPager => { this.viewPager = viewPager; } }>
						{ pages }
					</ViewPagerAndroid>
					<Actionbar style = { styles.actionbar }
						onselect = {this.onSelectMenu}
						currentPage = { this.state.page }/>
				</View>

        );
    }
}

var styles = StyleSheet.create({
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
    actionbarContainer: {
        height: 50,
        paddingTop: 5,
        flexDirection: 'row',
        backgroundColor: '#4f4f4f',
        alignItems: 'center'
    },
    actionActive: {
        color: '#3f80dc'
    },
    actionItem: {
        flex: 1,
        height: 50,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    actionbarIcon: {
        width: 25,
        height: 25,
    },
    actionText: {
        color: '#888888',
        textAlign: 'center'
    },
    viewPager: {
        flex: 1,
    }
});