# API

#### Usage

```javascript
import JMessage from 'jmessage-react-plugin';
```

#### NOTE：

- 调用其他接口前需要调用 `init `方法.

    ```javascript
    JMessage.init({
      appkey: "换成在极光官网上注册的应用 Appkey",
      isOpenMessageRoaming: false // 是否开启消息漫游，默认不开启
      isProduction: true, // 是否为生产模式
    })	
    ```

- 用户相关接口需要登录以后才能正常使用，如下是账户相关接口。

    ```javascript
    // 注册
    JMessage.register({
      username: "登录用户名",
      password: "登录密码"
    }， () => {/*注册成功回调*/}, (error) => {/*注册失败回调*/})

    // 登录
    JMessage.login({
      username: "登录用户名",
      password: "登录密码"
    }，() => {/*登录成功回调*/}, (error) => {/*登录失败回调*/})

    // 登出
    JMessage.logout()

    // 监听登录状态变更
    //由于 JMessage 只提供单点登录，所以一般还需要监听应用登录状态的改变，如果其他设备登录相同账号会把当前设备应用用户挤下线
    var listener = (event) => { }  
    // 回调函数返回参数 event = {'type': 'user_password_change' / 'user_logout' / 'user_deleted' / 'user_login_status_unexpected'}
    JMessage.addLoginStateChangedListener(listener)    // 监听登录状态变更
    JMessage.removeLoginStateChangedListener(listener) // 移除监听

    ```

- 可以通过 `getMyInfo` 接口来判断，应用当前的登录状态。

    ```javascript
    JMessage.getMyInfo((result) => {
    	if (result.username === undefine) {
          // 未登录
    	} else {
          // 已登录
    	}
    })
    ```

- 发送消息，有两种方式。

    ```javascript
    // 第一种方式 先创建消息，然后再发送
    //1. 创建消息
    JMessage.createSendMessage(params)  // params 参数字段可以参考 index.js 中的注释

    //2. 发送消息  
    JMessage.sendMessage(params)
    ```

    ```javascript
    // 第二种方式，快捷发送消息
    JMessage.sendTextMessage(params)   // 快捷发送文本消息
    JMessage.sendVoiceMessage(params)  // 快捷发送语音消息
    JMessage.sendImageMessage(params)  // 快捷发送图片消息
    JMessage.sendFileMessage(params)   // 快捷发送文件消息
    JMessage.sendCustomMessage(params) // 快捷发送自定义消息
    ```

    ​

- 接收消息

    ```javascript
    var listener = (message) => {
      // 收到的消息会返回一个消息对象. 对象字段可以参考对象说明
    }

    JMessage.addReceiveMessageListener(listener) // 添加监听
    JMessage.removeReceiveMessageListener(listener) // 移除监听(一般在 componentWillUnmount 中调用)
    ```

    ​


## 常用对象说明

API 使用文档可以直接参考 [index.js](../index.js) 中的注释。

这里列出插件中会返回的各对象组成：

```js
UserInfo: {
    type: 'user',
    username: string,           // 用户名。
    appKey: string,             // 用户所属应用的 appKey。可与 username 共同作为用户的唯一标志。
    nickname: string,           // 昵称。
    gender: string,             // 'male' / 'female' / 'unknown'
    avatarThumbPath: string,    // 头像的缩略图地址。
    birthday: number,           // 日期的毫秒数。
    region: string,             // 地区。
    signature: string,          // 个性签名。
    address: string,            // 具体地址。
    noteName: string,           // 备注名。
    noteText: string,           // 备注信息。
    isNoDisturb: boolean,       // 是否免打扰。
    isInBlackList: boolean,     // 是否在黑名单中。
    isFriend:boolean            // 是否为好友。
}
```

```js
GroupInfo: {
    type: 'group',
    id: string,                 // 群组 id，
    name: string,               // 群组名称。
    desc: string,               // 群组描述。
    level: number,              // 群组等级，默认等级 4。
    owner: string,              // 群主的 username。
    ownerAppKey: string,        // 群主的 appKey。
    maxMemberCount: number,     // 最大成员数。
    isNoDisturb: boolean,       // 是否免打扰。
    isBlocked: boolean          // 是否屏蔽群消息。
}
```

```js
Conversation: {
    /**
    *   会话对象标题。
    *   如果为群聊：
    *       - 未设置群名称：自动使用群成员中前五个人的名称拼接成 title。
    *       - 设置了群名称，则显示群名称。
    *   如果为单聊：如果用户有昵称，显示昵称。否则显示 username。
    */
    title: string,
    latestMessage: Message, // 最近的一条消息对象。
    unreadCount: number,    // 未读消息数。
    conversationType: 'single' / 'group',
    target: UserInfo / GroupInfo    // 聊天对象信息。
}
```

#### Message

```js
TextMessage: {
    id: string,                     // 消息 id。
    type: 'text',                   // 消息类型。
    from: UserInfo,                 // 消息发送者对象。
    target: UserInfo / GroupInfo,   // 消息接收者对象。可能是用户或群组。
    createTime: number,             // 发送消息时间。
    text: string,                   // 消息内容。
    extras: object                  // 附带的键值对对象。
}
```

```js
ImageMessage: {
    id: string,
    type: 'image',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    thumbPath: string              // 图片的缩略图路径。要下载原图需要调用 `downloadOriginalImage` 方法。
}
```

```js
VoiceMessage: {
    id: string,
    type: 'image',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    path: string,                   // 语音文件路径。
    duration: number                // 语音时长
}
```

```js
LocationMessage: {
    id: string,
    type: 'voice',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    address: string,                // 详细地址。
    longitude: number,              // 经度。
    latitude: number,               // 纬度。
    scale:number                    // 地图缩放比例。
}
```

```js
FileMessage: {
    id: string,
    type: 'file',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    fileName: string             // 文件名。要下载完整文件需要调用 `downloadFile` 方法。
}
```

```js
CustomMessage: {
    id: string,
    type: 'file',
    from: UserInfo,
    target: UserInfo / GroupInfo,
    extras: object,
    customObject: object         // 自定义键值对对象。
}
```

```js
Event: {
    type: 'event',
    eventType: string,       // 'group_member_added' / 'group_member_removed' / 'group_member_exit'
    usernames: Array         // 该事件涉及到的用户 username 数组。
}
```