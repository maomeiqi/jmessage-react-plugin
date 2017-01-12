'use strict'

import React from 'react';
import ReactNative from 'react-native';

var {
  Text,
  View,
  Image,
  TouchableHighlight,
  Dimensions,
  BackAndroid,
  StyleSheet
} = ReactNative;
import Camera from 'react-native-camera';

var CameraActivity = React.createClass({

  takePicture() {
    this.camera.capture()
      .then((data) => console.log(data))
      .catch(err => console.error(err));
  },

  componentDidMount() {
    var navigator = this.props.navigator;
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
      <View style={styles.container}>
        		<Camera
        			ref={(cam) => {
          	  			this.camera = cam;
          			}}
          			style={styles.preview}
          			aspect={Camera.constants.Aspect.fill}>
          			<Text style={styles.capture} onPress={this.takePicture}>[CAPTURE]</Text>
          			<TouchableHighlight
          				onPress = { this.takePicture }>
          				<View>
          					<Image source = { {uri: 'take_photo_me'} }
          						style = { styles.image }/>
          				</View>
          			</TouchableHighlight>
        		</Camera>
      		</View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3f80dc',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  },
  image: {
    width: 50,
    height: 50,
  }
});

module.exports = CameraActivity