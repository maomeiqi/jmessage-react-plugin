package io.jchat.android.tools;



import android.content.Context;
import android.util.Base64;
import android.util.Base64InputStream;
import android.util.Log;

import com.google.gson.Gson;


import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import io.jchat.android.R;
import io.jchat.android.entity.MyConversation;

public class ConversationToJSON {
    private String mResult;

    public ConversationToJSON(Context context, Conversation conv) {
        MyConversation myConversation;
        String title;
        String username = "";
        long groupId = 0;
        String avatar = "head_icon";
        int unreadMsgCnt;
        String date;
        String lastMsg = "";
        title = conv.getTitle();
        File avatarFile = conv.getAvatarFile();
        if (avatarFile != null) {
            //因为图片放在包名下,不能直接将路径作为JS中Image的uri,
            // 而Image控件的uri支持base64格式,所以将图片转为base64字符串, 注意要加上前缀
            avatar = "data:image/png;base64," + getBinaryData(avatarFile);
        }
        if (conv.getType() == ConversationType.single) {
            username = ((UserInfo) conv.getTargetInfo()).getUserName();
        } else {
            avatar = "group";
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
        myConversation = new MyConversation(title, username, groupId, avatar, unreadMsgCnt,
                date, lastMsg, conv.getTargetAppKey());
        Gson gson = new Gson();
        mResult = gson.toJson(myConversation);
    }

    public ConversationToJSON(Context context, List<Conversation> data) {
        List<MyConversation> list = new ArrayList<>();
        MyConversation myConversation;
        String title;
        String username = "";
        long groupId = 0;
        String avatar = "head_icon";
        int unreadMsgCnt;
        String date;
        String lastMsg = "";
        for (Conversation conv : data) {
            title = conv.getTitle();
            File avatarFile = conv.getAvatarFile();
            if (avatarFile != null) {
                avatar = "data:image/png;base64," + getBinaryData(avatarFile);
            }
            if (conv.getType() == ConversationType.single){
                avatar = "head_icon";
                username = ((UserInfo) conv.getTargetInfo()).getUserName();
            } else {
                avatar = "group";
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
            myConversation = new MyConversation(title, username, groupId, avatar, unreadMsgCnt,
                    date, lastMsg, conv.getTargetAppKey());
            list.add(myConversation);
        }
        Gson gson = new Gson();
        mResult = gson.toJson(list);
    }

    private String getBinaryData(File file) {
        try {
            FileInputStream fis = new FileInputStream(file);
            byte[] byteArray = new byte[fis.available()];
            fis.read(byteArray);
            fis.close();
            byte [] encode = Base64.encode(byteArray, Base64.DEFAULT);
            return new String(encode);
        } catch (Exception e) {
            e.printStackTrace();
            return "head_icon";
        }
    }


    public String getResult() {
        return mResult;
    }
}
