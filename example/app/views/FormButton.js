'use strict'

import React from 'react'
import PropTypes from 'prop-types';
import
{
  StyleSheet,
  View,
  Button,
} from 'react-native'

var {
    Component,
} = React;

var styles = StyleSheet.create({
  signin: {
    marginLeft: 10,
    marginRight: 10
  },
  button: {
    backgroundColor: '#FF3366',
    borderColor: '#FF3366'
  }
})

class FormButton extends Component {
    
    
    static propTypes = {
        title: PropTypes.string,
        onPress: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.title = props.title
        this.style = props.style 
        this.onPress = this.onPress.bind(this);
    }

    onPress() {
        if (!this.props.onPress) {
            return;
          }
        this.props.onPress();
    }

    render () {
        return (
            <Button
            style={this.style}
            color="#FF3366"
            title={this.title}
            onPress = {this.onPress}
            />
        )
    }
}

module.exports = FormButton