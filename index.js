import {
    NativeModules,
    Platform,
    DeviceEventEmitter
} from 'react-native';

const JMessageModule = NativeModules.JMessageModule;

const listeners = {};
const receiveMsgEvent = "JMessage.ReceiveMsgEvent"; // 接收到消息事件
const receiptMsgEvent = "JMessage.ReceiptMsgEvent"; // 接收已读消息回执事件
const loginStateChanged = "JMessage.LoginStateChanged"; // 
const clickMessageNotificationEvent = "JMessage.ClickMessageNotification"; // 点击推送 Android Only
const syncOfflineMessage = "JMessage.SyncOfflineMessage" // 同步离线消息事件
const syncRoamingMessage = "JMessage.SyncRoamingMessage" // 同步漫游消息事件
const messageRetract = "JMessage.MessageRetract" // 消息撤回事件
const contactNotify = "JMessage.ContactNotify" // 收到好友请求消息事件
const uploadProgress = "JMessage.UploadProgress" // 收到好友请求消息事件
const conversationChange = "JMessage.conversationChange" // 会话变更事件
const chatRoomMsgEvent = "JMessage.ReceiveChatRoomMsgEvent"; // 收到聊天室消息事件
const CommandNotificationEvent = "JMessage.CommandNotificationEvent"; // 收到聊天室消息事件 

const receiveApplyJoinGroupApprovalEvent = "JMessage.ReceiveApplyJoinGroupApprovalEvent" // 接收到入群申请
const receiveGroupAdminRejectEvent = "JMessage.ReceiveGroupAdminRejectEvent" // 接收到管理员拒绝入群申请
const receiveGroupAdminApprovalEvent = "JMessage.ReceiveGroupAdminApprovalEvent" // 接收到管理员同意入群申请

export default class JMessage {

    /**
     * @param {object} params = {
     *  'appkey': String， // 极光官网注册的应用 AppKey
     *  'isOpenMessageRoaming': boolean,  // 是否开启消息漫游，不传默认关闭。
     *  'isProduction': Boolean, // 是否为生产模式
     *  'channel': String // (选填)应用的渠道名称
     * }
     *
     * 打开消息漫游之后，用户多个设备之间登录时，SDK 会自动将当前登录用户的历史消息同步到本地。
     */
    static init(params) {
        JMessageModule.setup(params)
    }

    /**
     * 设置是否开启 debug 模式，开启后 SDK 将会输出更多日志信息。应用对外发布时应关闭。
     *
     * @param {object} params = {'enable': Boolean}
     */
    static setDebugMode(params) {
        // exec(null, null, PLUGIN_NAME, 'setDebugMode', [params])
        JMessageModule.setDebugMode(params)
    }

    /**
     * @param {object} params = {'username': String, 'password': String}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static register(params, success, error) {
        JMessageModule.userRegister(params, success, error)
    }

    /**
     * @param {object} params = {'username': String, 'password': String}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static login(params, success, error) {
        // exec(success, error, PLUGIN_NAME, 'userLogin', [params])
        JMessageModule.login(params, success, error)
    }

    /**
     * 用户登出接口，调用后用户将无法收到消息。登出动作必定成功，开发者不需要关心结果回调。
     *
     * @param {function} success = function () {}
     */
    static logout() {
        JMessageModule.logout()
    }

    /**
     * 登录成功则返回用户信息，已登出或未登录则对应用户信息为空对象。
     *
     * @param {function} success = function (myInfo) {}
     */
    static getMyInfo(success) {
        JMessageModule.getMyInfo(success);
    }

    /**
     * 获取用户信息，此接口可用来获取不同 appKey 下用户的信息，如果 appKey 为空，则默认获取当前 appKey 下的用户信息。
     *
     * @param {object} params = {'username': String, 'appKey': String}
     * @param {function} success = function (userInfo) {} // 通过参数返回用户对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getUserInfo(params, success, error) {
        JMessageModule.getUserInfo(params, success, error)
    }

    /**
     * @param {object} params = {'oldPwd': String, 'newPwd': String}
     */
    static updateMyPassword(params, success, error) {
        JMessageModule.updateMyPassword(params, success, error)
    }

    /**
     * 更新当前用户头像。
     * 
     * @param {object} params = {
     *  imgPath: string // 本地图片绝对路径。
     * }  
     * 注意 Android 与 iOS 的文件路径是不同的：
     *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
     *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
     */
    static updateMyAvatar(params, success, error) {
        JMessageModule.updateMyAvatar(params, success, error)
    }

    /**
     * 更新当前登录用户的信息。
     *
     * @param {object} params = {'field': '需要更新的字段值'}
     *
     *  field 包括：nickname（昵称）, birthday（生日）, signature（签名）, gender（性别）, region（地区）, address（具体地址），extras （附加信息）。
     *  如：{
     *    'birthday': Number,  // 生日日期的微秒数
     *    'gender': String,    // 'male' / 'female' / 'unknown'
     *    'extras': {String: String} // 附加字段
     *    ...                  // 其余皆为 String 类型
     *  }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static updateMyInfo(params, success, error) {
        JMessageModule.updateMyInfo(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,                                // 'single' / 'group'
     *  'messageType': String,                         // 'text', 'image', 'voice', 'location', 'file', 'custom'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'text': String,                                // Optional 消息内容
     *  'path': String                                 // Optional 资源路径
     *  'fileName': String,                            // Optional 文件名
     *  'latitude': Number,                            // Optional 纬度信息
     *  'longitude': Number,                           // Optional 经度信息
     *  'scale': Number,                               // Optional 地图缩放比例
     *  'address': String,                             // Optional 详细地址信息
     *  'customObject': {'key1': 'value1'}  // Optional. Optional 自定义键值对
     *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
     * }
     * @param {function} callback = function (msg) {}   // 以参数形式返回消息对象。
     */
    static createSendMessage(params, callback) {
        JMessageModule.createSendMessage(params, callback);
    }

    /**
     * @param {object} params = {
     *  'id': String,                                  // message id
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
     * } 
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendMessage(params, success, error) {
        JMessageModule.sendMessage(params, success, error);
    }

    /**
     * 消息转发。
     * 注意：只能转发消息状态为 SendSucceed 和 ReceiveSucceed 的消息。
     * @param {object} params = {
     *  'id': String,                                  // message id
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'target': Object (User or Group)               // 转发的对象，
     *     > 如果 target 是 user : {'type': 'user','username': string, appKey: string}, appkey 缺省时为应用 Appkey，
     *     > 如果 target 是 group: {'type': 'group','id': string }
     * 
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
     * } 
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static forwardMessage(params, success, error) {
        JMessageModule.sendMessage(params, success, error);
    }
    
    /**
     * @param {object} params = {
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'text': String,                                // 消息内容
     *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendTextMessage(params, success, error) {
        JMessageModule.sendTextMessage(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'path': String,                                // 本地图片路径
     *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendImageMessage(params, success, error) {
        JMessageModule.sendImageMessage(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'path': String,                                // 本地图片路径
     *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendVoiceMessage(params, success, error) {
        JMessageModule.sendVoiceMessage(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
     *  'username': String,                            // 当 type = single 时，username 不能为空
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'path': String,                                // 本地视频路径
     *  'name': String,                                // 本地视频名
     *  'thumbPath': String,                           // 本地视频缩略图路径
     *  'format': String,                              // 本地视频缩略图格式
     *  'duration': int,                               // 本地视频播放时长
     *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendVideoMessage(params, success, error) {
        JMessageModule.sendVideoMessage(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,           // 'single' / 'group'
     *  'groupId': String,        // 当 type = group 时，groupId 不能为空
     *  'username': String,       // 当 type = single 时，username 不能为空
     *  'appKey': String,         // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'customObject': {'key1': 'value1'}  // Optional. 自定义键值对
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendCustomMessage(params, success, error) {
        JMessageModule.sendCustomMessage(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,           // 'single' / 'group'
     *  'groupId': String,        // 当 type = group 时，groupId 不能为空
     *  'username': String,       // 当 type = single 时，username 不能为空
     *  'appKey': String,         // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'latitude': Number,       // 纬度信息
     *  'longitude': Number,      // 经度信息
     *  'scale': Number,          // 地图缩放比例
     *  'address': String,        // 详细地址信息
     *  'extras': Object          // Optional. 自定义键值对 = {'key1': 'value1'}
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendLocationMessage(params, success, error) {
        JMessageModule.sendLocationMessage(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'type': String,                                // 'single' / 'group'
     *  'groupId': String,                             // 当 type = group 时，groupId 不能为空。
     *  'username': String,                            // 当 type = single 时，username 不能为空。
     *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'path': String,                                // 本地文件路径。
     *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
     *  'messageSendingOptions': MessageSendingOptions // Optional. MessageSendingOptions 对象。
     * }
     * @param {function} success = function (msg) {}   // 以参数形式返回消息对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendFileMessage(params, success, error) {
        JMessageModule.sendFileMessage(params, success, error)
    }

    /**
     * 消息撤回。
     *
     * @param {object} params = {
     *  'type': String,       // 'single' / 'group'
     *  'groupId': String,    // 当 type = group 时，groupId 不能为空。
     *  'username': String,   // 当 type = single 时，username 不能为空。
     *  'appKey': String,     // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'messageId': String   // 消息 id。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static retractMessage(params, success, error) {
        JMessageModule.retractMessage(params, success, error)
    }

    /**
     * 从最新的消息开始获取历史消息。
     * 当 from = 0 && limit = =1 时，返回所有历史消息。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 当 type = group 时，groupId 不能为空。
     *  'username': String,        // 当 type = single 时，username 不能为空。
     *  'appKey': String,          // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'from': Number,            // 开始的消息下标。
     *  'limit': Number            // 要获取的消息数。比如当 from = 0, limit = 10 时，是获取第 0 - 9 条历史消息。
     *  'isDescend': Bool          // 2.3.5 新增。如果设置为 true，则返回的消息列表按照时间降序排列，反之，按照时间顺序排列。
     * }
     * @param {function} success = function (messageArray)) {}  // 以参数形式返回历史消息对象数组
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getHistoryMessages(params, success, error) {
        JMessageModule.getHistoryMessages(params, success, error)
    }


    /**
     *
     * 根据messageId删除消息
     *
     * @param {object} params = {
     *  'type': String,       // 'single' / 'group'
     *  'groupId': String,    // 当 type = group 时，groupId 不能为空。
     *  'username': String,   // 当 type = single 时，username 不能为空。
     *  'appKey': String,     // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
     *  'messageId': String   // 消息 id。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static deleteMessage(params,success,error){
    	JMessageModule.deleteMessage(params,success,error)
    }

    /**
     * 发送好友请求。
     *
     * @param {object} params = {
     *  'username': String,   // 对方用户用户名。
     *  'appKey': String,     // 对方用户所属应用的 AppKey。
     *  'reason': String      // 申请原因。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static sendInvitationRequest(params, success, error) {
        JMessageModule.sendInvitationRequest(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'username': String,   // 对方用户用户名。
     *  'appKey': String,     // 对方用户所属应用的 AppKey。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static acceptInvitation(params, success, error) {
        JMessageModule.acceptInvitation(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'username': String,   // 对方用户用户名。
     *  'appKey': String,     // 对方用户所属应用的 AppKey。
     *  'reason': String      // 拒绝原因。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static declineInvitation(params, success, error) {
        JMessageModule.declineInvitation(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'username': String,   // 好友用户名。
     *  'appKey': String,     // 好友所属应用的 AppKey。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static removeFromFriendList(params, success, error) {
        JMessageModule.removeFromFriendList(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'username': String,   // 好友用户名。
     *  'appKey': String,     // 好友所属应用的 AppKey。
     *  'noteName': String    // 备注名。
     * }
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static updateFriendNoteName(params, success, error) {
        JMessageModule.updateFriendNoteName(params, success, error)
    }

    /**
     * @param {object} params = {
     *  'username': String,   // 好友用户名。
     *  'appKey': String,     // 好友所属应用的 AppKey。
     *  'noteName': String    // 备注信息。
     * }
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static updateFriendNoteText(params, success, error) {
        JMessageModule.updateFriendNoteText(params, success, error)
    }

    /**
     * @param {function} success = function (friendArr) {}  // 以参数形式返回好友对象数组
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getFriends(success, error) {
        JMessageModule.getFriends(success, error)
    }

    /**
     * 创建群组，创建成功后，创建者默认会包含在群成员中。
     *
     * @param {object} params = {
     *  'name': String          // 群组名称。
     *  'desc': String          // 群组描述。
     *  'groupType': String      //  'public' | 'private'
     * }
     * @param {function} success = function (groupId) {}  // 以参数形式返回 group id
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static createGroup(params, success, error) {
        JMessageModule.createGroup(params, success, error)
    }

    /**
     * 获取当前用户所有所在的群组 id。
     *
     * @param {function} success = function (groupIdArray) {} // 以参数形式返回 group id 数组
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getGroupIds(success, error) {
        JMessageModule.getGroupIds(success, error)
    }

    /**
     * @param {object} params = {'id': '群组 id'}
     * @param {function} success = function (groupInfo) {} // 以参数形式返回群组信息对象
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getGroupInfo(params, success, error) {
        JMessageModule.getGroupInfo(params, success, error)
    }

    /**
     * @param {object} params = {'id': '群组 id', 'newName': '新群组名称', 'newDesc': '新群组介绍'}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static updateGroupInfo(params, success, error) {
        JMessageModule.updateGroupInfo(params, success, error)
    }

    /**
     * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待添加用户所在应用的 appKey'}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static addGroupMembers(params, success, error) {
        JMessageModule.addGroupMembers(params, success, error)
    }

    /**
     * @param {object} params = {'id': '群组 id', 'usernameArray': [用户名数组], 'appKey': '待删除用户所在应用的 appKey'}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static removeGroupMembers(params, success, error) {
        JMessageModule.removeGroupMembers(params, success, error)
    }

    /**
     * @param {object} params = {'id': '群组 id'}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static exitGroup(params, success, error) {
        JMessageModule.exitGroup(params, success, error)
    }

    /**
     * @param {object} params = {'id': '群组 id'}
     * @param {function} success = function (userInfoArray) {} // 以参数形式返回用户对象数组
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getGroupMembers(params, success, error) {
        JMessageModule.getGroupMembers(params, success, error)
    }

    /**
     * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static addUsersToBlacklist(params, success, error) {
        JMessageModule.addUsersToBlacklist(params, success, error)
    }

    /**
     * @param {object} params = {'usernameArray': [用户名数组], 'appKey': '用户所属 AppKey'}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static removeUsersFromBlacklist(params, success, error) {
        JMessageModule.removeUsersFromBlacklist(params, success, error)
    }

    /**
     * @param {function} success = function (userInfoArray) {} // 以参数形式返回黑名单中的用户信息数组
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getBlacklist(success, error) {
        JMessageModule.getBlacklist(success, error)
    }

    /**
     * 设置是否屏蔽群消息。
     *
     * @param {Object} params = { id: String, isBlock: boolean }
     */
    static blockGroupMessage(params, success, error) {
        JMessageModule.blockGroupMessage(params, success, error)
    }

    /**
     * 判断指定群组是否被屏蔽。
     *
     * @param {object} params = { id: String }
     * @param {function} success = function ({ isBlocked: boolean }) {} // 以参数形式返回结果。
     */
    static isGroupBlocked(params, success, error) {
        JMessageModule.isGroupBlocked(params, success, error)
    }

    /**
     * 获取当前用户的群屏蔽列表。
     *
     * @param {function} success = function (groupArr) {} // 以参数形式返回结果。
     */
    static getBlockedGroupList(success, error) {
        JMessageModule.getBlockedGroupList(success, error)
    }

    /**
     * 设置某个用户或群组是否免打扰。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'isNoDisturb': Boolean     // 是否免打扰。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static setNoDisturb(params, success, error) {
        JMessageModule.setNoDisturb(params, success, error)
    }

    /**
     * 获取免打扰用户和群组名单。
     *
     * @param {function} success = function ({userInfoArray: [], groupInfoArray: []}) {}  // 以参数形式返回用户和群组对象数组
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getNoDisturbList(success, error) {
        JMessageModule.getNoDisturbList(success, error)
    }

    /**
     * 设置是否全局免打扰。
     *
     * @param {object} params = {'isNoDisturb': Boolean}
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static setNoDisturbGlobal(params, success, error) {
        JMessageModule.setNoDisturbGlobal(params, success, error)
    }

    /**
     * 判断当前是否全局免打扰。
     *
     * @param {function} success = function ({'isNoDisturb': Boolean}) {} // 以参数形式返回结果
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static isNoDisturbGlobal(success, error) {
        JMessageModule.isNoDisturbGlobal(success, error)
    }

    /**
     * 下载用户头像缩略图，如果已经下载，不会重复下载。
     *
     * @param {object} params = {'username': String, 'appKey': String}
     * @param {function} success = function ({'username': String, 'appKey': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadThumbUserAvatar(params, success, error) {
        JMessageModule.downloadThumbUserAvatar(params, success, error)
    }

    /**
     * 下载用户头像原图，如果已经下载，不会重复下载。
     *
     * @param {object} params = {'username': String, 'appKey': String}
     * @param {function} success = function ({'username': String, 'appKey': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadOriginalUserAvatar(params, success, error) {
        JMessageModule.downloadOriginalUserAvatar(params, success, error)
    }

    /**
     * 下载指定图片消息的缩略图，如果已经下载，会直接返回本地文件路径，不会重复下载。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'messageId': String        // 指定消息 id。
     * }
     * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadOriginalImage(params, success, error) {
        JMessageModule.downloadOriginalImage(params, success, error)
    }

    /**
     * 下载指定图片消息的原图，如果已经下载，会直接返回本地文件路径，不会重复下载。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'messageId': String        // 指定消息 id。
     * }
     * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadThumbImage(params, success, error) {
        JMessageModule.downloadThumbImage(params, success, error)
    }

    /**
     * 下载语音消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
     * 
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'messageId': String        // 指定消息 id。
     * }
     * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadVoiceFile(params, success, error) {
        JMessageModule.downloadVoiceFile(params, success, error)
    }

    /**
     * 下载文件消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'messageId': String        // 指定消息 id。
     * }
     * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadVideoFile(params, success, error) {
        JMessageModule.downloadVideoFile(params, success, error)
    }

    /**
     * 下载文件消息文件，如果已经下载，会直接返回本地文件路径，不会重复下载。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'messageId': String        // 指定消息 id。
     * }
     * @param {function} success = function ({'messageId': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadFile(params, success, error) {
        JMessageModule.downloadFile(params, success, error)
    }

    /**
     * 创建聊天会话。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group' / 'chatRoom'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'roomId': String,          // 聊天室 id.
     * }
     * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static createConversation(params, success, error) {
        JMessageModule.createConversation(params, success, error)
    }

    /**
     * 删除聊天会话，同时会删除本地聊天记录。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group' / 'chatRoom'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     *  'roomId': String,          // 聊天室 id.
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static deleteConversation(params, success, error) {
        JMessageModule.deleteConversation(params, success, error)
    }

    /**
     * Android Only
     * 进入聊天会话。可以在进入聊天会话页面时调用该方法，这样在收到当前聊天用户的消息时，不会显示通知。
     *  
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static enterConversation(params, success, error) {
        if (Platform.OS === 'android') {
            JMessageModule.enterConversation(params, success, error)
        }
    }

    /**
     * Android Only
     * 退出会话，和 enterConversation 方法成对使用
     */
    static exitConversation() {
        if (Platform.OS === 'android') {
            JMessageModule.exitConversation()
        }
    }

    /**
     * iOS Only
     * 设置服务器 badge 值，用于 badge+1 功能
     * 成功返回 true
     */
    static setBadge (badge, cb) {
        if (Platform.OS === 'ios') {
            JMessageModule.setBadge(badge, value => {
              cb(value)
            })
        }
    }


    /**
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group' / 'chatRoom'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'roomId': String,          // 聊天室 id.
     *  'appKey': String,          // 目标用户所属 AppKey。
     * }
     * @param {function} success = function (conversation) {} // 以参数形式返回聊天会话对象。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getConversation(params, success, error) {
        JMessageModule.getConversation(params, success, error)
    }

    /**
     * @param {function} success = function (conversationArray) {}  // 以参数形式返回会话对象数组。
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getConversations(success, error) {
        JMessageModule.getConversations(success, error)
    }

    /**
     * 重置单个会话的未读消息数。
     *
     * @param {object} params = {
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     * }
     * @param {function} success = function () {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static resetUnreadMessageCount(params, success, error) {
        JMessageModule.resetUnreadMessageCount(params, success, error)
    }

    /**
     * 更新当前用户头像。
     * 
     * @param {object} params = {
     *  id: string // 目标群组的 id。
     *  imgPath: string // 本地图片绝对路径。
     * }  
     * 注意 Android 与 iOS 的文件路径是不同的：
     *   - Android 类似：/storage/emulated/0/DCIM/Camera/IMG_20160526_130223.jpg
     *   - iOS 类似：/var/mobile/Containers/Data/Application/7DC5CDFF-6581-4AD3-B165-B604EBAB1250/tmp/photo.jpg
     */
    static updateGroupAvatar(params, success, error) {
        JMessageModule.updateGroupAvatar(params, success, error)
    }

    /**
     * 下载群组头像缩略图，如果已经下载，不会重复下载。
     *
     * @param {object} params = {'id': String}
     * @param {function} success = function ({'id': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadThumbGroupAvatar(params, success, error) {
        JMessageModule.downloadThumbGroupAvatar(params, success, error)
    }

    /**
     * 下载群组头像原图，如果已经下载，不会重复下载。
     *
     * @param {object} params = {'id': String}
     * @param {function} success = function ({'id': String, 'filePath': String}) {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static downloadOriginalGroupAvatar(params, success, error) {
        JMessageModule.downloadOriginalGroupAvatar(params, success, error)
    }

    /**
     * 增加或更新扩展字段,可扩展会话属性，比如：会话置顶、标识特殊会话等
     *
     * @param {object} params = {
     *  'extras': Object            // 附加字段对象
     *  'type': String,            // 'single' / 'group'
     *  'groupId': String,         // 目标群组 id。
     *  'username': String,        // 目标用户名。
     *  'appKey': String,          // 目标用户所属 AppKey。
     * }
     * @param {function} success = function (conversation) {} // 具体字段参考文档
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static setConversationExtras(params, success, error) {
        JMessageModule.setConversationExtras(params, success, error)
    }

    /**
     * 设置消息已读
     * @param {object} params = {
     *   必填，不可为空
     *  ‘type’: String  single/group/chatroom
     * 
     *   type为single时,除了下面的其他值可缺省
     *  'username': String 
     *  'appKey': String
     *  'id': String
     * 
     *   type为group时,除了下面的其他值可缺省
     *  'groupId': String
     *  
     *   type为chatroom时,除了下面的其他值可缺省
     *  'roomId': String 
     *    
     *    必填，不可为空
     *   'id': String
     *  
     * }
     *  @param {function} successCallback =  function () {}
     *  @param {function} failCallback =  function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static setMsgHaveRead(params,successCallback,failCallback){
        JMessageModule.setMsgHaveRead(params,successCallback,failCallback)
    }

    /**
     * 
     * JMessage Events
     * 
     */

    /**
     * 添加收到消息事件监听。
     *
     * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
     * message = {
     *  'id': String,
     *  'from': object,    // 消息发送者信息对象。
     *  'target': object,  // 消息接收方信息（可能为用户或者群组）。
     *  'type': String     // 'text' / 'image' / 'voice' / 'location' / 'file' / 'custom' / 'event'
     *  ...                // 不同消息类型还有其他对应的相关字段，具体可参考文档。
     * }
     */
    static addReceiveMessageListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(receiveMsgEvent,
            (message) => {
                listener(message);
            });
    }

    static removeReceiveMessageListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }

    /**
     * 添加收到消息事件监听。
     *
     * @param {function} listener = function (result) {}  // 以参数形式返回消息对象。
     * result = {
     *      receiptResult = {
     *          'serverMessageId': String
     *          'unReceiptCount': int
     *          'unReceiptMTime': String
     *      },
     *      receiptResult = {
     *          'serverMessageId': String
     *          'unReceiptCount': int
     *          'unReceiptMTime': String
     *      },
     *      ...
     * 
     * }
     */
    static addReceiptMessageListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(receiptMsgEvent,
            (result) => {
                listener(result);
            });
    }

    static removeReceiptMessageListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }    

    /**
     * 添加点击通知栏消息通知事件监听。
     * Note: Android only, (如果想要 iOS 端 实现相同的功能，需要同时集成 jpush-react-native)
     * @param {function} listener = function (message) {}  // 以参数形式返回消息对象。
     */
    static addClickMessageNotificationListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(clickMessageNotificationEvent,
            (message) => {
                listener(message);
            });
    }

    static removeClickMessageNotificationListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }

    /**
     * 添加同步离线消息事件监听。
     *
     * @param {function} listener = function ({'conversation': {}, 'messageArray': []}) {}  // 以参数形式返回消息对象数组。
     */
    static addSyncOfflineMessageListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(syncOfflineMessage,
            (message) => {
                listener(message);
            });
    }

    static removeSyncOfflineMessageListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }

    /**
     * 添加同步漫游消息事件监听。
     *
     * @param {function} listener = function ({'conversation': {}}) {}  // 以参数形式返回消息对象数组。
     */
    static addSyncRoamingMessageListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(syncRoamingMessage,
            (message) => {
                listener(message);
            });
    }

    static removeSyncRoamingMessageListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }

    /**
     * 添加登录状态变更事件监听。
     *
     * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
     * event = {
     *  'type': String, // 'user_password_change' / 'user_logout' / 'user_deleted' / 'user_login_status_unexpected'
     * }
     */
    static addLoginStateChangedListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(loginStateChanged,
            (message) => {
                listener(message);
            });
    }
    static removeLoginStateChangedListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }

    /**
     * 好友相关通知事件。
     *
     * @param {function} listener = function (event) {}  // 以参数形式返回事件信息。
     * event = {
     *  'type': String,            // 'invite_received' / 'invite_accepted' / 'invite_declined' / 'contact_deleted'
     *  'reason': String,          // 事件发生的理由，该字段由对方发起请求时所填，对方如果未填则返回默认字符串。
     *  'fromUsername': String,    // 事件发送者的 username。
     *  'fromUserAppKey': String   // 事件发送者的 AppKey。
     * }
     */
    static addContactNotifyListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(contactNotify,
            (message) => {
                listener(message);
            });
    }
    static removeContactNotifyListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }
        
    /**
     * 消息撤回事件监听。
     *
     * @param {function} listener = function (event) {} // 以参数形式返回事件信息。
     * event = {
     *  'conversation': Object      // 会话对象。
     *  'retractedMessage': Object  // 被撤回的消息对象。
     * }
     */
    static addMessageRetractListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(messageRetract,
            (message) => {
                listener(message);
            });
    }

    static removeMessageRetractListener(listener) {
            if (!listeners[listener]) {
                return;
            }
            listeners[listener].remove();
            listeners[listener] = null;
        }
    
    /**
     * 
     * @param {function} listener  = function (result) {}
     * result = {
     *  messageId = String, // 消息 Id
     *  progress = Float // 消息文件上传的进度
     * }
     */
    static addUploadProgressListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(uploadProgress,
            (message) => {
                listener(message);
            });
    }

    static removeUploadProgressListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }

    /**
     * 接收聊天室消息
     * @param {function} listener = function([{Message}])
     */
    static addReceiveChatRoomMsgListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(chatRoomMsgEvent,
            (messages) => {
                listener(messages);
            });
    }

    static removeReceiveChatRoomMsgListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }

    /**
     * 接收命令透传消息
      * @param {function} listener  = function (result) {}
     *  result = {
     *  type = String, //类型，single:单聊;group:群聊;self:自己已登录设备间的命令透传
     *  send = {userInfo}, //命令透传消息发送者的UserInfo
     *  target = {userInfo/groupInfo} //type为'single'时userInfo,type为‘groupInfo’时groupInfo
     *  message = String // 命令透传消息的实际内容
     *  
     * }
     */
    static addCommandNotificationListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(CommandNotificationEvent,
            (messages) => {
                listener(messages);
            });
    }

    static removeCommandNotificationListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }


    /**
     * 监听接收入群申请事件
     * @param {function} listener = function([{Message}])
     */
    static addReceiveApplyJoinGroupApprovalListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(receiveApplyJoinGroupApprovalEvent,
            (event) => {
                listener(event);
            });
    }

    static removeReceiveApplyJoinGroupApprovalListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }

    /**
     * 监听管理员拒绝入群申请事件
     * @param {function} listener = function([{Message}])
     */
    static addReceiveGroupAdminRejectListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(receiveGroupAdminRejectEvent,
            (event) => {
                listener(event);
            });
    }

    static removeReceiveGroupAdminRejectListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }

    /**
     * 监听管理员同意入群申请事件
     * @param {function} listener = function([{Message}])
     */
    static addReceiveGroupAdminApprovalListener(listener) {
        listeners[listener] = DeviceEventEmitter.addListener(receiveGroupAdminApprovalEvent,
            (event) => {
                listener(event);
            });
    }

    static removeReceiveGroupAdminApprovalListener(listener) {
        if (!listeners[listener]) {
            return;
        }
        listeners[listener].remove();
        listeners[listener] = null;
    }

    /**
     * 查询当前 AppKey 下的聊天室信息
     * @param {object} param = {
     *  "start": number,  // 起始位置
     *  "count": number,  // 获取个数
     * }
     * ChatRoomInfo = {
     *  "roomId": String,
     *  "roomName": String,
     *  "appKey": String,
     *  "maxMemberCount": number,
     *  "memberCount": number,
     *  "owner": UserInfo,
     *  "description": String,
     *  "createTime": number,
     * }
     * @param {function} success = function([{chatRoomInfo}]) 
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getChatRoomListByApp(param, success, error) {
        JMessageModule.getChatRoomListByApp(param, success, error);
    }

    /**
     * 获取当前用户所加入的所有聊天室信息
     * @param {function} success = function([{ChatRoomInfo}]) 
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getChatRoomListByUser(success, error) {
        JMessageModule.getChatRoomListByUser(success, error);
    }

    /**
     * 查询指定 roomId 聊天室信息
     * @param {object} param = {roomIds: [String]}
     * @param {function} success = function([{ChatRoomInfo}])
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getChatRoomInfos(param, success, error) {
        JMessageModule.getChatRoomInfos(param, success, error);
    }

    /**
     * 查询指定 roomId 聊天室的所有者
     * @param {object} param = {roomId: String}
     * @param {function} success = function({userInfo})
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
     */
    static getChatRoomOwner(param, success, error) {
        JMessageModule.getChatRoomOwner(param, success, error);
    }

    /**
     * 进入聊天室，进入后才能收到聊天室信息及发言
     * @param {object} param = {roomId: String} 
     * @param {function} success = function({conversation})
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static enterChatRoom(param, success, error) {
        JMessageModule.enterChatRoom(param, success, error);
    }

    /**
     * 离开聊天室
     * @param {object} param = {roomId: String} 
     * @param {function} success = function(0)
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static leaveChatRoom(param, success, error) {
        JMessageModule.leaveChatRoom(param, success, error);
    }

    /**
     * 从本地获取用户的聊天室会话列表，没有则返回为空的列表
     * @param {function} callback = function([{Conversation}])
     * 
     */
    static getChatRoomConversationList(callback) {
        JMessageModule.getChatRoomConversationList(callback);
    }
    

    /**
     * 获取所有会话未读消息总数
     * @param {function} callback = function([{count: number}])
     */
    static getAllUnreadCount(callback) {
        JMessageModule.getAllUnreadCount(callback);
    }


    /**
     * Group 相关功能
     */

    /**
     * 批量添加管理员
     * @param {object} param = {groupId: string, usernames: [string], appKey: string}
     * @param {function} success 
     * @param {function} error 
     */
    static addGroupAdmins(param, success, error) {
        JMessageModule.addGroupAdmins(param, success, error);
    }
    
    /**
     * 批量删除管理员
     * @param {object} param = {groupId: string, usernames: [string], appKey: string}
     * @param {function} success 
     * @param {function} error 
     */
    static removeGroupAdmins(param, success, error) {
        JMessageModule.removeGroupAdmins(param, success, error);
    }

    /**
     * 修改群类型，
     * @param {object} param = {groudId: String, type: 'public' | 'private'} 
     * @param {function} success = function({conversation})
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static changeGroupType(param, success, error) {
        JMessageModule.changeGroupType(param, success, error);
    }
    
    /**
     * 分页获取群
     * @param {object} param = {appKey: string, start: number, count: number} 
     * @param {function} success = function([groupInfo])
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static getPublicGroupInfos(param, success, error) {
        JMessageModule.getPublicGroupInfos(param, success, error);
    }

    /**
     * 申请入群（公开群）
     * @param {object} param = {groupId: string, reason: string} 
     * @param {function} success = function()
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static applyJoinGroup(param, success, error) {
        JMessageModule.applyJoinGroup(param, success, error);
    }

    /**
     * 批量处理公开群入群请求
     * @param {object} param = {events: [string], isAgree: boolean, reason: string, isRespondInviter: boolean}
     *  events: 请求的 eventId 数组。
     *  isAgree: 是否同意入群。
     *  isRespondInviter: 是否将处理结果返回给申请入群者
     * @param {function} success = _ => {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static processApplyJoinGroup(param, success, error) {
        JMessageModule.processApplyJoinGroup(param, success, error);
    }

    /**
     * 解散群
     * @param {object} param = { groupId: string }
     * @param {function} success = _ => {}
     * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {} 
     */
    static dissolveGroup(param, success, error) {
        JMessageModule.dissolveGroup(param, success, error);
    }
    /**
   * 移交群主
   * @param {object} params = { groupId: string , username: string, appKey: string}
   * @param {function} success = function = _ => {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  static transferGroupOwner(param, success, error) {
    JMessageModule.transferGroupOwner(param, success, error);
  }

  /**
   * 设置禁言或解禁用户
   * @param {object} params = { groupId: string, isSilence: Boolean, username: string, appKey: string }
   * @param {function} success = _ => {}
   * @param {function} error  = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  static setGroupMemberSilence(param, success, error) {
    JMessageModule.setGroupMemberSilence(param, success, error);
  }

  /**
   * 判断用户是否被禁言
   * @param {object} params = { groupId: string, username: string, appKey: string }
   * @param {function} success = ({isSilence: Boolean}) {}
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  static isSilenceMember(param, success, error) {
    JMessageModule.isSilenceMember(param, success, error);
  }

  /**
   * 获取群禁言列表 （注意在获取群列表成功后该方法才有效）
   * @param {object} params = { groupId: string}
   * @param {function} success 
   * @param {function} error = function ({'code': '错误码', 'description': '错误信息'}) {}
   */
  static groupSilenceMembers(param, success, error) {
    JMessageModule.groupSilenceMembers(param, success, error);
  }

   /**
    * 设置群成员昵称
    * @param {object} params = { nickName: string, groupId: string , username: string, appKey: string}
    * @param {function} success  = _ => {}
    * @param {function} error  = function ({'code': '错误码', 'description': '错误信息'}) {}
    */
    static setGroupNickname(param, success, error) {
    JMessageModule.setGroupNickname(param, success, error);
  }

}