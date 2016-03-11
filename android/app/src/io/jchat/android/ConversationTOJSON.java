package io.jchat.android;



import android.content.Context;
import android.util.Log;

import com.google.gson.Gson;


import java.io.File;
import java.util.ArrayList;
import java.util.List;

import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;

public class ConversationToJSON {
    private String mResult;

    public ConversationToJSON(Context context, Conversation conv) {
        MyConversation myConversation;
        String title;
        String username = "";
        long groupId = 0;
        String avatarPath = "head_icon";
        int unreadMsgCnt;
        String date;
        String lastMsg = "";
        title = conv.getTitle();
        File avatarFile = conv.getAvatarFile();
        if (avatarFile != null) {
            avatarPath = "'file://" + avatarFile.getAbsolutePath() + ".png'";
            Log.i("Path", "avatarPath: " + avatarPath);
        }
        if (conv.getType() == ConversationType.single) {
            username = ((UserInfo) conv.getTargetInfo()).getUserName();
        } else {
            avatarPath = "group";
            groupId = ((GroupInfo) conv.getTargetInfo()).getGroupID();
        }
        unreadMsgCnt = conv.getUnReadMsgCnt();
        date = TimeFormat.getTime(context, conv.getLastMsgDate());
        Message message = conv.getLatestMessage();
        if (message != null) {
            // 按照最后一条消息的消息类型进行处理
            switch (message.getContentType()) {
                case image:
                    lastMsg = context.getString(R.string.type_picture);
                    break;
                case voice:
                    lastMsg = context.getString(R.string.type_voice);
                    break;
                case location:
                    lastMsg = context.getString(R.string.type_location);
                    break;
                case eventNotification:
                    lastMsg = context.getString(R.string.group_notification);
                    break;
                case custom:
                    CustomContent content = (CustomContent) message.getContent();
                    Boolean isBlackListHint = content.getBooleanValue("blackList");
                    if (isBlackListHint != null && isBlackListHint) {
                        lastMsg = context.getString(R.string.server_803008);
                    } else {
                        lastMsg = context.getString(R.string.type_custom);
                    }
                    break;
                default:
                    lastMsg = ((TextContent) message.getContent()).getText();
            }
        }
        myConversation = new MyConversation(title, username, groupId, avatarPath, unreadMsgCnt, date, lastMsg);
        Gson gson = new Gson();
        mResult = gson.toJson(myConversation);
    }

    public ConversationToJSON(Context context, List<Conversation> data) {
        List<MyConversation> list = new ArrayList<>();
        MyConversation myConversation;
        String title;
        String username = "";
        long groupId = 0;
        String avatarPath = "head_icon";
        int unreadMsgCnt;
        String date;
        String lastMsg = "";
        for (Conversation conv : data) {
            title = conv.getTitle();
            File avatarFile = conv.getAvatarFile();
            if (avatarFile != null) {
                avatarPath = "'file://" + avatarFile.getAbsolutePath() + ".png'";
                Log.i("Path", "avatarPath: " + avatarPath);
            }
            if (conv.getType() == ConversationType.single){
                username = ((UserInfo) conv.getTargetInfo()).getUserName();
            } else {
                avatarPath = "group";
                groupId = ((GroupInfo) conv.getTargetInfo()).getGroupID();
            }
            unreadMsgCnt = conv.getUnReadMsgCnt();
            date = TimeFormat.getTime(context, conv.getLastMsgDate());
            Message message = conv.getLatestMessage();
            if (message != null) {
                // 按照最后一条消息的消息类型进行处理
                switch (message.getContentType()) {
                    case image:
                        lastMsg = context.getString(R.string.type_picture);
                        break;
                    case voice:
                        lastMsg = context.getString(R.string.type_voice);
                        break;
                    case location:
                        lastMsg = context.getString(R.string.type_location);
                        break;
                    case eventNotification:
                        lastMsg = context.getString(R.string.group_notification);
                        break;
                    case custom:
                        CustomContent content = (CustomContent) message.getContent();
                        Boolean isBlackListHint = content.getBooleanValue("blackList");
                        if (isBlackListHint != null && isBlackListHint) {
                            lastMsg = context.getString(R.string.server_803008);
                        } else {
                            lastMsg = context.getString(R.string.type_custom);
                        }
                        break;
                    default:
                        lastMsg = ((TextContent) message.getContent()).getText();
                }
            }
            myConversation = new MyConversation(title, username, groupId, avatarPath, unreadMsgCnt, date, lastMsg);
            list.add(myConversation);
        }
        Gson gson = new Gson();
        mResult = gson.toJson(list);
    }

    public String getResult() {
        return mResult;
    }
}
