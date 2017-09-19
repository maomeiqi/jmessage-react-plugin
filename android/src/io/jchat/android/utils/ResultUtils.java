package io.jchat.android.utils;



import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.EventNotificationContent;
import cn.jpush.im.android.api.content.FileContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.LocationContent;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.enums.MessageDirect;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;

public class ResultUtils {

    public static Map<String, String> fromMap(ReadableMap extras) {
        Map<String, String> map = new HashMap<String, String>();

        ReadableMapKeySetIterator keysItr = extras.keySetIterator();
        while (keysItr.hasNextKey()) {
            String key = keysItr.nextKey();
            String value = extras.getString(key);
            map.put(key, value);
        }
        return map;
    }

    public static WritableMap toJSObject(Map<String, String> map) {
        Iterator<String> iterator = map.keySet().iterator();

        WritableMap object = Arguments.createMap();
        while (iterator.hasNext()) {
            String key = iterator.next();
            object.putString(key, map.get(key));
        }
        return object;
    }

    public static WritableMap toJSObject(final UserInfo userInfo) {
        if (userInfo == null) {
            return Arguments.createMap();
        }
        final WritableMap result = Arguments.createMap();
        result.putString("type", "user");
        if (null != userInfo.getGender()) {
            result.putString("gender", userInfo.getGender().toString());
        } else {
            result.putString("gender", "unknown");
        }
        result.putString("username", userInfo.getUserName());
        result.putString("appKey", userInfo.getAppKey());
        result.putString("nickname", userInfo.getNickname());

        if (userInfo.getAvatarFile() != null) {
            result.putString("avatarThumbPath", userInfo.getAvatarFile().getAbsolutePath());
        } else {
            result.putString("avatarThumbPath", "");
        }

        result.putDouble("birthday", userInfo.getBirthday());
        result.putString("region", userInfo.getRegion());
        result.putString("signature", userInfo.getSignature());
        result.putString("address", userInfo.getAddress());
        result.putString("noteName", userInfo.getNotename());
        result.putString("noteText", userInfo.getNoteText());
        result.putBoolean("isNoDisturb", userInfo.getNoDisturb() == 1);
        result.putBoolean("isInBlackList", userInfo.getNoDisturb() == 1);
        result.putBoolean("isFriend", userInfo.isFriend());
        return result;
    }

    public static WritableMap toJSObject(GroupInfo groupInfo) {
        WritableMap result = Arguments.createMap();

        result.putString("type", "group");
        result.putDouble("id", groupInfo.getGroupID());
        result.putString("name", groupInfo.getGroupName());
        result.putString("desc", groupInfo.getGroupDescription());
        result.putInt("level", groupInfo.getGroupLevel());
        result.putString("owner", groupInfo.getGroupOwner());
        result.putString("ownerAppKey", groupInfo.getOwnerAppkey());
        result.putInt("maxMemberCount", groupInfo.getMaxMemberCount());
        result.putBoolean("isNoDisturb", groupInfo.getNoDisturb() == 1);
        result.putBoolean("isBlocked", groupInfo.isGroupBlocked() == 1);
        return result;
    }

    public static WritableMap toJSObject(Message msg) {
        WritableMap result = Arguments.createMap();
        try {
            result.putString("id", String.valueOf(msg.getId()));
            result.putMap("from", toJSObject(msg.getFromUser()));

            if (msg.getDirect() == MessageDirect.send) {
                if (msg.getTargetType() == ConversationType.single) {
                    result.putMap("target", toJSObject((UserInfo) msg.getTargetInfo()));
                } else if (msg.getTargetType() == ConversationType.group) {
                    result.putMap("target", toJSObject((GroupInfo) msg.getTargetInfo()));
                }

            } else {
                UserInfo myInfo = JMessageClient.getMyInfo();
                result.putMap("target", toJSObject(myInfo));
            }

            MessageContent content = msg.getContent();
            if (content.getStringExtras() != null) {
                result.putMap("extras", toJSObject(content.getStringExtras()));
            }

            result.putDouble("createTime", msg.getCreateTime());

            switch (msg.getContentType()) {
                case text:
                    result.putString("type", "text");
                    result.putString("text", ((TextContent) content).getText());
                    break;
                case image:
                    result.putString("type", "image");
                    result.putString("thumbPath", ((ImageContent) content).getLocalThumbnailPath());
                    break;
                case voice:
                    result.putString("type", "voice");
                    result.putString("path", ((VoiceContent) content).getLocalPath());
                    result.putInt("duration", ((VoiceContent) content).getDuration());
                    break;
                case file:
                    result.putString("type", "file");
                    result.putString("fileName", ((FileContent) content).getFileName());
                    break;
                case custom:
                    result.putString("type", "custom");
                    Map<String, String> customObject = ((CustomContent) content).getAllStringValues();
                    result.putMap("customObject", toJSObject(customObject));
                    break;
                case location:
                    result.putString("type", "location");
                    result.putDouble("latitude", ((LocationContent) content).getLatitude().doubleValue());
                    result.putDouble("longitude", ((LocationContent) content).getLongitude().doubleValue());
                    result.putString("address", ((LocationContent) content).getAddress());
                    result.putDouble("scale", ((LocationContent) content).getScale().doubleValue());
                    break;
                case eventNotification:
                    result.putString("type", "event");
                    List usernameList = ((EventNotificationContent) content).getUserNames();
                    result.putArray("usernames", toJSArray(usernameList));
                    switch (((EventNotificationContent) content).getEventNotificationType()) {
                        case group_member_added:
                            //群成员加群事件
                            result.putString("eventType", "group_member_added");
                            break;
                        case group_member_removed:
                            //群成员被踢事件
                            result.putString("eventType", "group_member_removed");
                            break;
                        case group_member_exit:
                            //群成员退群事件
                            result.putString("eventType", "group_member_exit");
                            break;
                    }
                default:
                    return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public static WritableMap toJSObject(Conversation conversation) {
        WritableMap map = Arguments.createMap();

        try {
            map.putString("title", conversation.getTitle());
            map.putString("conversationType", conversation.getType().name());
            map.putInt("unreadCount", conversation.getUnReadMsgCnt());

            if (conversation.getLatestMessage() != null) {
                map.putMap("latestMessage", toJSObject(conversation.getLatestMessage()));
            }

            if (conversation.getType() == ConversationType.single) {
                UserInfo targetInfo = (UserInfo) conversation.getTargetInfo();
                map.putMap("target", toJSObject(targetInfo));

            } else if (conversation.getType() == ConversationType.group) {
                GroupInfo targetInfo = (GroupInfo) conversation.getTargetInfo();
                map.putMap("target", toJSObject(targetInfo));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return map;
    }

    public static WritableArray toJSArray(List list) {
        WritableArray array = Arguments.createArray();

        for (Object object : list) {
            if (object instanceof UserInfo) {
                array.pushMap(toJSObject((UserInfo) object));
            } else if (object instanceof GroupInfo) {
                array.pushMap(toJSObject((GroupInfo) object));
            } else if (object instanceof Message) {
                array.pushMap(toJSObject((Message) object));
            } else if (object instanceof Conversation) {
                array.pushMap(toJSObject((Conversation) object));
            } else {
                array.pushString(object.toString());
            }
        }

        return array;
    }

    public static JSONObject toJSObject(String eventName, JSONObject value) {
        JSONObject result = new JSONObject();
        try {
            result.put("eventName", eventName);
            result.put("value", value);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return result;
    }
}
