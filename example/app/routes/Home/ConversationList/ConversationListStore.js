import {observable,action,computed,autorun} from 'mobx';
import JMessage from 'jmessage-react-plugin';
import ConversationListItem from './ConversationListItem';

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
        let item = new ConversationListItem()
        item.type = conversation.conversationType
        item.conversation = conversation
        item.key = index
        if (item.type === "single") {
            item.appKey = conversation.target.appKey
            item.username = conversation.target.username
            item.displayName = conversation.target.displayName
            if (item.displayName === "") {
                item.displayName = conversation.target.username
            }
            item.avatarThumbPath = conversation.target.avatarThumbPath
            if (item.avatarThumbPath === "") {
                JMessage.getUserInfo({username: item.username, appKey: item.appKey}, (userInfo) => {
                    console.log("Get user info succeed" + JSON.stringify(userInfo))
                    // TODO update conversation item
                }, (error) => {
                    console.log("Get user info failed, " + JSON.stringify(error))
                })
            }
        } else if (item.type === "group") {
            if (conversation.target.ownerAppKey != undefined) {
                item.appKey = conversation.target.ownerAppKey
            }
            item.groupId = conversation.target.id
            item.displayName = conversation.target.name
            item.avatarThumbPath = conversation.target.avatarThumbPath
            if (item.avatarThumbPath === "") {
                JMessage.getGroupInfo({id: item.groupId}, (groupInfo) => {
                    console.log("Get group info succeed " + JSON.stringify(groupInfo))
                    // TODO update conversation item
                }, (error) => {
                    console.log("Get group info failed, " + JSON.stringify(error))
                })
            }
        } else {
            item.appKey = conversation.target.appKey
            item.roomId = conversation.target.roomId
            item.avatarThumbPath = "../../../resource/chat-icon.png"
            item.displayName = conversation.target.roomName
            item.memberCount = conversation.target.memberCount
            item.maxMemberCount = conversation.target.maxMemberCount
        }

        if (conversation.latestMessage === undefined) {
            return item
        }

        if (conversation.latestMessage.type === 'text') {
            item.latestMessageString = conversation.latestMessage.text
        }

        if (conversation.latestMessage.type === 'image') {
            item.latestMessageString = '[图片]'
        }

        if (conversation.latestMessage.type === 'voice') {
            item.latestMessageString = '[语音]'
        }

        if (conversation.latestMessage.type === 'file') {
            item.latestMessageString = '[文件]'
        }

        return item
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

    @action insertConversation = (conv) => {
        this.convList.push(getListItem(conv, this.convList.length))
    }
}

export default new ConversationListStore