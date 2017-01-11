'use strict';

import React from 'react';
import {
	Provider
} from 'react-redux';
import BaseApp from './BaseApp';
import configureStore from '../store/configureStore';

const store = configureStore();

export default class ReactJChat extends React.Component {
	render() {
		return (
			<Provider store = { store }>
				<BaseApp />
			</Provider>
		);
	}
}