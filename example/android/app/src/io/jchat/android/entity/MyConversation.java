package io.jchat.android.entity;


public class MyConversation {

    private String title;
    private String username;
    private long groupId;
    private String avatarPath;
    private int unreadMsgCnt;
    private String date;
    private String lastMsg;
    private String appKey;

    public MyConversation(String title, String username, long groupId, String avatarPath,
                          int unreadMsgCnt, String date, String lastMsg, String appKey) {
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
