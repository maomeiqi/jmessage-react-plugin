					{ this.state.isKeyboard ?
					<View style = { styles.inputContent }>
						<TouchableHighlight style = { styles.voiceBtn }
							onPress = { () => this.setState({isKeyboard: false}) }>
							<Image style = { styles.voice }
								resizeMode = { 'stretch' }
								source = { {uri: 'voice'} }/>
						</TouchableHighlight>
						<TextInput style = { styles.textInput }
							onChangeText = { (text) => this.state.inputContent }
							multilines = { 4 }/>
					{ this.state.inputContent === '' ? 
						<TouchableHighlight 
							style = { styles.moreMenu }>
							<Image style = {{width: 25, height: 25, }}
								source = {{uri: 'more_menu'}}/>
						</TouchableHighlight> 
						:
						<TouchableHighlight
							style = { styles.sendBtn }
							underlayColor = { '#346fc3' }>
							<Text style = { styles.sendText }>
								发送
							</Text>
						</TouchableHighlight>
					}
					</View>
				 : 
				 	<View style = { styles.inputContent }>
				 		<TouchableHighlight style = { styles.keyboardBtn }
				 			onPress = { () => this.setState({isKeyboard: true}) }>
				 			<Image style = { {width: 25, height: 20} }
				 				resizeMode = { 'stretch' }
				 				source = { {uri: 'keyboard'}}/>
				 		</TouchableHighlight>
				 		<TouchableHighlight style = { styles.recordBtn }
				 			underlayColor = { '#3773cb' }>
				 			<Text style = { styles.recordText }>
				 				{ this.state.recordText }
				 			</Text>
				 		</TouchableHighlight>
						<TouchableHighlight 
							style = { styles.moreMenu }>
							<Image style = {{width: 25, height: 25, }}
								source = {{uri: 'more_menu'}}/>
						</TouchableHighlight>
					</View> 
				}