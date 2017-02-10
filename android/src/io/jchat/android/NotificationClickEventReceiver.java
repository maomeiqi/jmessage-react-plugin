package io.jchat.android;


import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.event.NotificationClickEvent;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.Message;

public class NotificationClickEventReceiver {
    private static final String TAG = NotificationClickEventReceiver.class.getSimpleName();

    private ReactApplicationContext mContext;

    public NotificationClickEventReceiver(ReactApplicationContext context) {
        mContext = context;
        //注册接收消息事件
        JMessageClient.registerEventReceiver(this);
    }

    /**
     * 收到消息处理
     * @param notificationClickEvent 通知点击事件
     */
    public void onEvent(NotificationClickEvent notificationClickEvent) {
        Log.d(TAG, "[onEvent] NotificationClickEvent !!!!");
        if (null == notificationClickEvent) {
            Log.w(TAG, "[onNotificationClick] message is null");
            return;
        }
        Message msg = notificationClickEvent.getMessage();
        if (msg != null) {
            String targetId = msg.getTargetID();
            String appKey = msg.getFromAppKey();
            ConversationType type = msg.getTargetType();
            Conversation conv;
            //TODO convert event to JS side
            WritableMap map = Arguments.createMap();
            map.putString("targetId",targetId);
            map.putString("appKey", appKey);
            map.putString("conversationType", type.toString());
            mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onClickNotification", map);
//            Intent notificationIntent = new Intent(mContext, ChatActivity.class);
//            if (type == ConversationType.single) {
//                conv = JMessageClient.getSingleConversation(targetId, appKey);
//                notificationIntent.putExtra(JChatDemoApplication.TARGET_ID, targetId);
//                notificationIntent.putExtra(JChatDemoApplication.TARGET_APP_KEY, appKey);
//                Log.d("Notification", "msg.fromAppKey() " + appKey);
//            } else {
//                conv = JMessageClient.getGroupConversation(Long.parseLong(targetId));
//                notificationIntent.putExtra(JChatDemoApplication.GROUP_ID, Long.parseLong(targetId));
//            }
//            conv.resetUnreadCount();
//            Log.d("Notification", "Conversation unread msg reset");
////        notificationIntent.setAction(Intent.ACTION_MAIN);
//            notificationIntent.putExtra("fromGroup", false);
//            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
//                    | Intent.FLAG_ACTIVITY_CLEAR_TOP);
//            mContext.startActivity(notificationIntent);
        }
    }

}
