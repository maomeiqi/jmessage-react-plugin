package io.jchat.android;


import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import io.jchat.android.tools.MessageToJSON;

public class MessageController extends ReactContextBaseJavaModule implements ActivityEventListener {

    private Context mContext;
    private List<Message> mMsgList = new ArrayList<>();
    private int mOffset = 18;
    private int mStart = 0;

    public MessageController(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "MessageController";
    }

    @Override
    public boolean canOverrideExistingModule() {
        return true;
    }

    @ReactMethod
    public void getMessages(String username, int groupId, String appKey, Callback callback) {
        mContext = getCurrentActivity();
        Conversation conv;
        if (groupId == 0) {
            conv = JMessageClient.getSingleConversation(username, appKey);
        } else {
            conv = JMessageClient.getGroupConversation(groupId);
        }
        mMsgList = conv.getMessagesFromNewest(mStart, mOffset);
        reverse(mMsgList);
        mStart = mOffset;
        MessageToJSON msgToJSON = new MessageToJSON(mContext, mMsgList);
        String result = msgToJSON.getResult();
        Log.i("MSGController", result);
        callback.invoke(result);
    }

    @ReactMethod
    public void getGroupMemberSize(int groupId, Callback beforeCallback) {
        Conversation conv = JMessageClient.getGroupConversation(groupId);
        GroupInfo groupInfo = (GroupInfo) conv.getTargetInfo();
        beforeCallback.invoke(groupInfo.getGroupMembers().size());
//        JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
//            @Override
//            public void gotResult(int status, String desc, GroupInfo groupInfo) {
//                if (status == 0) {
//                    String title = groupInfo.getGroupName();
//                    int number = groupInfo.getGroupMembers().size();
//                    WritableMap map = Arguments.createMap();
//                    map.putString("title", title);
//                    map.putInt("number", number);
//                    afterCallback.invoke(map);
//                } else {
//                    HandleResponseCode.onHandle(mContext, status, false);
//                }
//            }
//        });
    }

    public void reverse(List<Message> list) {
        if (list.size() > 1) {
            Collections.reverse(list);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {

    }
}
