import JMessage from 'jmessage-react-plugin';
import {observable,action,computed,autorun} from 'mobx';

export default class ConversationListItem {

    key

    @observable
    displayName

    @observable
    avatarThumbPath

    appKey

    groupId

    username

    roomId

    @observable
    latestMessageString

    @observable
    conversation

    type

}