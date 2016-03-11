'use strict'

var React = require('react-native');
var Conv = require('./conv_fragment');
var Contact = require('./contact_fragment');
var Me = require('./me_fragment');
var Orientation = require('react-native-orientation');
var {
    BackAndroid,
    Text,
    View,
    Image,
    TouchableHighlight,
    TouchableNativeFeedback,
    Navigator,
    Platform,
    ViewPagerAndroid,
} = React;

var Actionbar = React.createClass({

    isActive(index) {
        return this.props.currentPage == index;
    },
    onPageSelected(index) {
        this.props.onselect(index);
    },
    render() {
        var TouchableElement = TouchableHighlight;
        if (Platform.OS === 'android') {
            TouchableElement = TouchableNativeFeedback;
        };
        return (
            <View >
				<View style = { styles.actionbarContainer }>
						<TouchableElement
							onPress = { () => this.onPageSelected(0) }>
							<View style = { styles.actionItem }>
								<View style = { styles.actionIconRow }>
									<Image style = { styles.actionbarIcon }
										source = { this.isActive(0) ? require('image!actionbar_msg_sel') : require('image!actionbar_msg') }/>
								</View>
								<View style = { styles.actionIconRow }>
									<Text style = { [styles.actionText, this.isActive(0) ? styles.actionActive : '']}>
										聊天
									</Text>
								</View>
							</View>
						</TouchableElement>
						<TouchableElement
							onPress  = { () => this.onPageSelected(1) }>
							<View style = { styles.actionItem }>
								<View style = { styles.actionIconRow }>
									<Image style = { styles.actionbarIcon }
										source = { this.isActive(1) ? { uri: 'actionbar_contact_sel'} : {uri: 'actionbar_contact'}}/>
								</View>
								<View style = { styles.actionIconRow }>
									<Text style = { [styles.actionText, this.isActive(1) ? styles.actionActive : '']}>
										通讯录
									</Text>
								</View>
							</View>
						</TouchableElement>
						<TouchableElement
							onPress = { () => this.onPageSelected(2) }>
							<View style = { styles.actionItem }>
								<View style = { styles.actionIconRow }>
									<Image style = { styles.actionbarIcon }
										source = { this.isActive(2) ? { uri: 'actionbar_me_sel'} : {uri: 'actionbar_me'}}/>
								</View>
								<View style = { styles.actionIconRow }>
									<Text style = { [styles.actionText,  this.isActive(2) ? styles.actionActive : '']}>
										我
									</Text>
								</View>
							</View>
						</TouchableElement>
				</View>
			</View>

        );
    }
});


var MainActivity = React.createClass({
    getInitialState() {
        return {
            page: 0,
        };
    },
    
    onPageSelected(e) {
        console.log('Page selected!');
        this.setState({ page: e.nativeEvent.position });
    },

    componentDidMount() {
        Orientation.lockToPortrait();
        BackAndroid.addEventListener('hardwareBackPress', () => {
            if (this.props.navigator.getCurrentRoutes() > 0) {
                this.props.navigator.pop();
                return true;
            }
            return false;
        });
    },

    onSelectMenu(index) {
        if (index != this.state.page) {
            this.viewPager.setPage(index);
            this.setState({ page: index });
        };
    },

    render() {
        var pages = [];
        var pageStyle = {
                flex: 1
            };
        pages.push(
            <View key = { 0 } style = { pageStyle } collapsable = { true }>
                <Conv navigator = { this.props.navigator }/>
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
        var { page } = this.state;
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
    },
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
    actionIconRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionbarIcon: {
        flex: 1,
        width: 20,
        height: 20,
    },
    actionText: {
        color: '#888888',
        textAlign: 'center'
    },
    viewPager: {
        flex: 1,
    }
});

module.exports = MainActivity
