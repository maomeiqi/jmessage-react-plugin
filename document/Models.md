## Contents

- [UserInfo](#userinfo)
- [GroupInfo](#groupinfo)
- [GroupMemberInfo](#groupmemberinfo)
- [ChatRoomInfo](#chatroominfo)
- [Conversation](#conversation)
- [Message](#message)
  - [TextMessage](#textmessage)
  - [ImageMessage](#imagemessage)
  - [VoiceMessage](#voicemessage)
  - [LocationMessage](#locationmessage)
  - [FileMessage](#filemessage)
  - [CustomMessage](#custommessage)
  - [EventMessage](#eventmessage)
  

## UserInfo

```js
type: 'user',
username: string,           // 用户名
appKey: string,             // 用户所属应用的 appKey，可与 username 共同作为用户的唯一标识
nickname: string,           // 昵称
gender: string,             // 'male' / 'female' / 'unknown'
avatarThumbPath: string,    // 头像的缩略图地址
birthday: number,           // 日期的毫秒数
region: string,             // 地区
signature: string,          // 个性签名
address: string,            // 具体地址
noteName: string,           // 备注名
noteText: string,           // 备注信息
isNoDisturb: boolean,       // 是否免打扰
isInBlackList: boolean,     // 是否在黑名单中
isFriend:boolean            // 是否为好友
```

## GroupInfo

```js
type: 'group',
id: string,                 // 群组 id
groupType: string,          // 'public' | 'private'  公共群和私有群
avatarThumbPath: string,    // 头像的缩略图地址，不过不存在可以调用 下载缩略图的相关接口
name: string,               // 群组名称
desc: string,               // 群组描述
level?: number,              // 群组等级，默认等级 4
owner?: string,              // 群主的 username
ownerAppKey?: string,        // 群主的 appKey
maxMemberCount: number,     // 最大成员数
isNoDisturb?: boolean,       // 是否免打扰
isBlocked?: boolean          // 是否屏蔽群消息
```

## GroupMemberInfo

```js
user: UserInfo,             // 群成员用户信息
groupNickname: string,      // 群昵称
memberType: 'owner' | 'admin' | 'ordinary', // 分别对应：  群主 | 管理员 | 普通
joinGroupTime: number,      // 进群时间戳（毫秒）
```


## ChatRoomInfo

```js
type: 'chatroom',
roomId: string,             // 聊天室 id
roomName: string,           // 聊天室名字
appKey: string,             // 聊天室所属 AppKey
owner: UserInfo,            // 聊天室拥有者
maxMemberCount: number,     // 聊天室最大成员数量
description: string,        // 聊天室描述
memberCount: number,        // 聊天室当前成员数量
createTime: number          // 聊天室创建时间，单位 秒
```



## Conversation

- 单聊：如果用户有昵称，`title` 为昵称，否则为 username。
- 群聊：如果未设置群名称，使用群成员中前五个人的名称拼接成 title。

```js
title: string,                  // 会话标题
latestMessage: Message,         // 最近的一条消息对象
unreadCount: number,            // 未读消息数
conversationType: 'single' / 'group', / 'chatroom'
target: UserInfo / GroupInfo / ChatRoomInfo  // 聊天对象信息
```

## Message

### TextMessage

```js
id: string,                     // 消息 id
serverMessageId: string,     // 消息服务器Id 用于服务器追踪问题
type: 'text',                   // 消息类型
from: UserInfo,                 // 消息发送者对象
target: UserInfo / GroupInfo / ChatRoomInfo,   // 消息接收者对象
createTime: number,             // 发送消息时间
text: string,                   // 消息内容
extras: object                  // 附带的键值对
```

### ImageMessage

`thumbPath` 为缩略图路径，在收到消息时默认会自动下载。如果要下载原图，需要调用 `downloadOriginalImage` 方法。

```js
id: string,                    // 消息 id
serverMessageId: string,       // 消息服务器Id 用于服务器追踪问题
type: 'image',                 // 消息类型
from: UserInfo,                // 消息发送者对象
target: UserInfo / GroupInfo / ChatRoomInfo,  // 消息接收者对象
extras: object,                // 附带的键值对
thumbPath: string              // 图片的缩略图路径
localPath: string              // 图片本地路径
```

### VoiceMessage

```js
id: string,                     // 消息 id
serverMessageId: string,        // 消息服务器Id 用于服务器追踪问题
type: 'voice',                  // 消息类型
from: UserInfo,                 // 消息发送者对象
target: UserInfo / GroupInfo / ChatRoomInfo,   // 消息接收者对象
extras: object,                 // 附带的键值对
path: string,                   // 语音文件路径
duration: number                // 语音时长，单位秒
```

### LocationMessage

```js
id: string,                     // 消息 id
serverMessageId: string,        // 消息服务器Id 用于服务器追踪问题
type: 'location',               // 消息类型
from: UserInfo,                 // 消息发送者对象
target: UserInfo / GroupInfo / ChatRoomInfo,   // 消息接收者对象
extras: object,                 // 附带的键值对
address: string,                // 详细地址
longitude: number,              // 经度
latitude: number,               // 纬度
scale:number                    // 地图缩放比例
```

### FileMessage

如果要获取文件，需要调用 `downloadFile` 方法来下载文件。

```js
id: string,                     // 消息 id
serverMessageId: string,        // 消息服务器Id 用于服务器追踪问题
type: 'file',                   // 消息类型
from: UserInfo,                 // 消息发送者对象
target: UserInfo / GroupInfo / ChatRoomInfo,   // 消息接收者对象
extras: object,                 // 附带的键值对
fileName: string                // 文件名
```

### CustomMessage

```js
id: string,                     // 消息 id
serverMessageId: string,        // 消息服务器Id 用于服务器追踪问题
type: 'custom',                 // 消息类型
from: UserInfo,                 // 消息发送者对象
target: UserInfo / GroupInfo,   // 消息接收者对象
extras: object,                 // 附带的键值对
customObject: object            // 自定义键值对
```

### EventMessage

```js
type: 'event',           // 消息类型
eventType: string,       // 'group_member_added' / 'group_member_removed' / 'group_member_exit' / 'group_info_updated' / 'group_dissolved' / 'group_type_changed'
usernames: Array         // 该事件涉及到的用户 username 数组
```
