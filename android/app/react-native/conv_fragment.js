'use strict'

var React = require('react-native');
var {
	View,
	Text,
	TouchableHighlight,
	Image,
	ListView,
} = React;

var Conv = React.createClass({
	getInitialState() {
		var ds = new ListView.DataSource({ rowHasChanged: ( r1, r2) => r1 !== r2});
		return {
			dataSource: ds.cloneWithRows( this._genRows({})),
		};
	},

	_pressData: ({}: { [key: number] : boolean}),

	componentWillMount() {
		this._pressData = {};
	},

	_renderRow(rowData: string, sectionID: number, rowID: number) {
		return (
			<TouchableHighlight onPress = { () => this._pressRow(rowID)}>
				<View>
					<View style = { styles.row}>
						<View style = { {flexDirection: 'row'} }>
							<Image style = { styles.thumb } source = { {uri: 'head_icon'} } />
							<View style = { styles.msgHint }>
								<Text style = { styles.msgHintText }>
									10
								</Text>
							</View>
						</View>
						<View style = { {flex: 1, paddingRight: 5} }>
							<Text style = { styles.convName }
								numberOfLines = { 1 }>
								{ rowData }
							</Text>
							<Text style = { styles.msgContent }
								numberOfLines = { 1 }>
								dsafldskfdslsl撒放进卡可大了疯狂的螺蛳粉了
							</Text>
						</View>
					</View>
					<View style = { styles.separator } />
				</View>
			</TouchableHighlight>
		);
	},

	_genRows(pressData: { [key: number]: boolean}): Array<string> {
		var dataBlob = [];
		for(var ii = 0; ii < 10; ii++) {
			var pressedText = pressData[ii] ? 'pressed' : '';
			dataBlob.push('Row ' + ii + pressedText);
		}
		return dataBlob;
	},

	_pressRow(rowID: number) {
		this._pressData[rowID] = !this._pressData[rowID];
		this.setState({dataSource: this.state.dataSource.cloneWithRows(
			this._genRows(this._pressData)
		)});
	},

	showDropDownMenu() {

	},
	render() {
		return (
				<View style = { styles.container }>
					<View style = { styles.titlebar }>
						<Text style = { styles.titleLeft }>
						</Text>
						<Text style = { styles.title }>
							会话
						</Text>
						<TouchableHighlight
							style = { styles.titlebarBtn }
							underlayColor = { '#3773cb'}
							onPress = { this.showDropDownMenu }>
							<Image style = { styles.titlebarImage }
								source = { {uri: 'msg_titlebar_right_btn'}}/>
						</TouchableHighlight>
					</View>
					<ListView style = { styles.listView }
						dataSource = { this.state.dataSource }
						renderRow = { this._renderRow }/>
				</View>
			);
	}
});

var styles = React.StyleSheet.create({
	container: {
		flex: 1,
		
	},
	titlebar: {
		height: 40,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#3f80dc'
	},
	title: {
		textAlign: 'center',
		fontSize: 22,
		color: '#ffffff'
	},
	titleLeft: {
		width: 40,
		height: 40,
	},
	titlebarBtn: {
		right: 0,
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center'
	},
	titlebarImage: {
		width: 20,
		height: 20,
	},
	listView: {
		flex: 1,

	},
	row: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 5,
		paddingBottom: 5,
		backgroundColor: '#f6f6f6',
	},
	separator: {
		height: 1,
		backgroundColor: '#cccccc',
	},
	thumb: {
		width: 50,
		height: 50,
	},
	msgHint: {
		borderColor: '#ffffff',
		borderWidth: 1,
		borderRadius: 10,
		backgroundColor: '#fa3e32',
		alignSelf: 'flex-start',
		justifyContent: 'center',
		position: 'relative',
		top: 0,
		right: 15,
		width: 20,
		height: 20,
	},
	msgHintText: {
		alignSelf: 'center',
		color: '#ffffff',
		
	},
	convName: {
		fontSize: 18,
		color: '#3f80dc',
	},
	msgContent: {
		fontSize: 16,
		color: '#808080',
	}
});

module.exports = Conv