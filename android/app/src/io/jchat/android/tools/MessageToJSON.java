package io.jchat.android.tools;


import android.content.Context;

import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.List;

import cn.jpush.im.android.api.content.EventNotificationContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.MessageDirect;
import cn.jpush.im.android.api.model.Message;
import io.jchat.android.entity.MyMessage;

public class MessageToJSON {
    private String mResult;

    public MessageToJSON(Context context, List<Message> data) {
        List<MyMessage> list = new ArrayList<>();
        String direction, type, date, content, sendState;
        MyMessage myMessage;
        for(Message msg : data) {
            direction = msg.getDirect() == MessageDirect.send ? "send" : "receive";
            date = TimeFormat.getTime(context, msg.getCreateTime());
            switch (msg.getContentType()) {
                case image:
                    type = "image";
                    ImageContent imageContent = (ImageContent) msg.getContent();
                    content = imageContent.getLocalThumbnailPath();
                    break;
                case voice:
                    type = "voice";
                    VoiceContent voiceContent = (VoiceContent) msg.getContent();
                    content = voiceContent.getDuration() + "'";
                    break;
                case text:
                    type = "text";
                    TextContent textContent = (TextContent) msg.getContent();
                    content = textContent.getText();
                    break;
                case location:
                    type = "location";
                    content = "";
                    break;
                case custom:
                    type = "custom";
                    content = "";
                    break;
                default:
                    type = "event";
                    content = ((EventNotificationContent) msg.getContent()).getEventText();
                    break;
            }
            switch (msg.getStatus()) {
                case send_going:
                    sendState = "sending";
                    break;
                case send_fail:
                    sendState = "sendFailed";
                    break;
                case send_success:
                    sendState = "sendSuccess";
                    break;
                default:
                    sendState = "";
            }
            myMessage = new MyMessage(direction, type, date, content, sendState);
            list.add(myMessage);
        }
        Gson gson = new Gson();
        mResult = gson.toJson(list);
    }

    public String getResult() {
        return mResult;
    }
}
