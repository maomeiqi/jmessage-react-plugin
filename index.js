import {
	NativeModules,
	Platform,
	DeviceEventEmitter
} from 'react-native';

const JMessageModule = NativeModules.JMessageModule;

const listeners = {};
const receiveMsgEvent = "receiveMsgEvent";
const receiveLoginState = "receiveLoginState";
const openNotificationEvent = "openNotification";

/**
 * Logs message to console with the [JMessage] prefix
 * @param  {string} message
 */
const log = (message) => {
		console.log(`[JMessage] ${message}`);
	}
	// is function
const isFunction = (fn) => typeof fn === 'function';
/**
 * create a safe fn env
 * @param  {any} fn
 * @param  {any} success
 * @param  {any} error
 */
const safeCallback = (fn, success, error) => {

	JMessageModule[fn](function(params) {
		log(params);
		isFunction(success) && success(params)
	}, function(error) {
		log(error)
		isFunction(error) && error(error)
	})

}

export default class JMessage {

	/**
	 * Android only
	 * mode is number from 0 to 4(include 0 and 4)
	 */
	static init(mode) {
		JMessageModule.init(mode);
	}

	static isLogin(cb) {
		JMessageModule.isLogin((map) => {
			cb(map);
		});
	}

	// static login(username, password, cb) {
	// 	JMessageModule.login(username, password).then((resp) => {
	// 		cb(resp);
	// 	}).catch((e) => {
	// 		cb(e);
	// 	});
	// }


	/**
	 * Android
	 */
	static addReceiveMsgListener(cb) {
		listeners[cb] = DeviceEventEmitter.addListener(receiveMsgEvent,
			(message) => {
				cb(message);
			});
	}

	/**
	 * Android
	 */
	static removeReceiveMsgListener(cb) {
		if (!listeners[cb]) {
			return;
		}
		listeners[cb].remove();
		listeners[cb] = null;
	}

}