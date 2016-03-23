'use strict';

import React, { Component } from 'react-native';
import { Provider } from 'react-redux';
import BaseApp from './BaseApp';
import configureStore from '../store/configureStore';

const store = configureStore();

export default class ReactJChat extends Component {
	render() {
		return (
			<Provider store = { store }>
				<BaseApp />
			</Provider>
		);
	}
 }