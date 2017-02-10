'use strict';

import React from 'react';
import ReactNative from 'react-native';

var {
	PropTypes,
	Component
} = React;
var {
	View,
	requireNativeComponent
} = ReactNative;
var BubbleTextView = requireNativeComponent("BubbleView", BubbleView);

export default class BubbleView extends Component {

	static propTypes = {
		...View.propTypes,
		text: PropTypes.string,
		type: PropTypes.bool,
	};


	constructor(props) {
		super(props);
	}

	render() {
		return (
			<BubbleTextView {...this.props}/>
		);
	}
}