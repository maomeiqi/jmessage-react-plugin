package io.jchat.android;


public class MyConversation {

    private String title;
    private String username;
    private long groupId;
    private String avatarPath;
    private int unreadMsgCnt;
    private String date;
    private String lastMsg;

    public MyConversation(String title, String username, long groupId, String avatarPath,
                          int unreadMsgCnt, String date, String lastMsg) {
        this.title = title;
        this.username = username;
        this.groupId = groupId;
        this.avatarPath = avatarPath;
        this.unreadMsgCnt = unreadMsgCnt;
        this.date = date;
        this.lastMsg = lastMsg;
    }
}
