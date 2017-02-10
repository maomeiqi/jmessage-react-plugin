package io.jchat.android.entity;


public class MyConversation {

    private String id;
    private String title;
    private String username;
    private String groupId;
    private String avatarPath;
    private int unreadMsgCnt;
    private long date;
    private String lastMsg;
    private String appKey;

    public MyConversation(String id, String title, String username, String groupId, String avatarPath,
                          int unreadMsgCnt, long date, String lastMsg, String appKey) {
        this.id = id;
        this.title = title;
        this.username = username;
        this.groupId = groupId;
        this.avatarPath = avatarPath;
        this.unreadMsgCnt = unreadMsgCnt;
        this.date = date;
        this.lastMsg = lastMsg;
        this.appKey = appKey;
    }
}
