import {observable,action,computed,autorun} from 'mobx';
import JMessage from 'jmessage-react-plugin';

class ConversationListStore {
    @observable
    convList = []

    convertToConvList = (list) => {
        list.map((conversation, index) => {
            this.convList.push(this.getListItem(conversation, index))
        })
        return this.convList.slice()
    }

    getListItem(conversation, index) {
        var newItem = {}
        newItem.key = index
        newItem.conversation = conversation
        newItem.type = conversation.conversationType
        if (conversation.conversationType === "single") {
            newItem.appKey = conversation.target.appKey
            newItem.username = conversation.target.username
            newItem.avatarThumbPath = conversation.target.avatarThumbPath
            newItem.displayName = conversation.target.nickname
            console.log("nickname: " + newItem.displayName)
            if (newItem.displayName == "") {
                newItem.displayName = conversation.target.username
            }
            if (newItem.avatarThumbPath === "") {
                JMessage.getUserInfo({username: newItem.username, appKey: newItem.appKey}, (userInfo) => {
                    console.log("Get user info succeed" + JSON.stringify(userInfo))
                    newItem.nickname = userInfo.nickname
                    newItem.avatarThumbPath = userInfo.avatarThumbPath
                }, (error) => {
                    console.log("Get user info failed, " + JSON.stringify(error))
                })
            }
        } else if (conversation.conversationType === "group") {
            newItem.appKey = conversation.target.ownerAppKey
            newItem.groupId = conversation.target.id
            newItem.displayName = conversation.target.name
            newItem.avatarThumbPath = conversation.target.avatarThumbPath
            if (newItem.avatarThumbPath === "") {
                JMessage.getGroupInfo({id: groupId}, (groupInfo) => {
                    console.log("Get group info succeed")
                    newItem.avatarThumbPath = groupInfo.avatarThumbPath
                    newItem.displayName = groupInfo.displayName
                }, (error) => {
                    console.log("Get group info failed, " + JSON.stringify(error))
                })
            }
        } else {
            newItem.appKey = conversation.target.appKey
            newItem.roomId = conversation.target.roomId
            newItem.avatarThumbPath = "../../../resource/chat-icon.png"
            newItem.displayName = conversation.target.roomName
            newItem.memberCount = conversation.target.memberCount
            newItem.maxMemberCount = conversation.target.maxMemberCount
        }

        if (conversation.latestMessage === undefined) {
            return newItem
        }

        if (conversation.latestMessage.type === 'text') {
            newItem.latestMessageString = conversation.latestMessage.text
        }

        if (conversation.latestMessage.type === 'image') {
            newItem.latestMessageString = '[图片]'
        }

        if (conversation.latestMessage.type === 'voice') {
            newItem.latestMessageString = '[语音]'
        }

        if (conversation.latestMessage.type === 'file') {
            newItem.latestMessageString = '[文件]'
        }

        return newItem
    }

    @action deleteConversation = (key) => {
        var item = this.convList[key]
        JMessage.deleteConversation(item, (code) => {
            this.convList.splice(key, 1)
            console.log("Delete succeed")
        }, (error) => {
            console.log("Delete failed, error: "  + JSON.stringify(error))
        })
    }
}

export default new ConversationListStore