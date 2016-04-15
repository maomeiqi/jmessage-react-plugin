'use strict';

var React = require('react-native');
var conversationActions = require('./conversationActions');
var messageActions = require('./messageActions');
var actions = {};
Object.assign(actions, conversationActions);
Object.assign(actions, messageActions);
module.exports = actions;