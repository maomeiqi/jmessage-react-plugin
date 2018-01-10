package io.jchat.android.utils;



import android.text.TextUtils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.jpush.JsonElement;
import com.google.gson.jpush.JsonObject;
import com.google.gson.jpush.JsonParser;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
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
import cn.jpush.im.android.api.model.ChatRoomInfo;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import io.jchat.android.Constant;

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
        result.putString(Constant.TYPE, Constant.TYPE_USER);
        if (null != userInfo.getGender()) {
            result.putString(Constant.GENDER, userInfo.getGender().toString());
        } else {
            result.putString(Constant.GENDER, "unknown");
        }
        result.putString(Constant.USERNAME, userInfo.getUserName());
        result.putString(Constant.APP_KEY, userInfo.getAppKey());
        result.putString(Constant.NICKNAME, userInfo.getNickname());

        if (userInfo.getAvatarFile() != null) {
            result.putString(Constant.AVATAR_THUMB_PATH, userInfo.getAvatarFile().getAbsolutePath());
        } else {
            result.putString("avatarThumbPath", "");
        }
        if (userInfo.getExtras() != null && userInfo.getExtras().size() > 0) {
            result.putMap(Constant.EXTRAS, toJSObject(userInfo.getExtras()));
        }
        result.putDouble(Constant.BIRTHDAY, userInfo.getBirthday());
        result.putString(Constant.REGION, userInfo.getRegion());
        result.putString(Constant.SIGNATURE, userInfo.getSignature());
        result.putString(Constant.ADDRESS, userInfo.getAddress());
        result.putString(Constant.NOTE_NAME, userInfo.getNotename());
        result.putString(Constant.NOTE_TEXT, userInfo.getNoteText());
        result.putBoolean(Constant.IS_NO_DISTURB, userInfo.getNoDisturb() == 1);
        result.putBoolean(Constant.IS_IN_BLACKLIST, userInfo.getBlacklist() == 1);
        result.putBoolean(Constant.IS_FRIEND, userInfo.isFriend());
        return result;
    }

    public static WritableMap toJSObject(GroupInfo groupInfo) {
        WritableMap result = Arguments.createMap();

        result.putString(Constant.TYPE, Constant.TYPE_GROUP);
        result.putString(Constant.ID, String.valueOf(groupInfo.getGroupID()));
        result.putString(Constant.NAME, groupInfo.getGroupName());
        result.putString(Constant.DESC, groupInfo.getGroupDescription());
        result.putInt(Constant.LEVEL, groupInfo.getGroupLevel());
        result.putString(Constant.OWNER, groupInfo.getGroupOwner());
        result.putString(Constant.OWNER_APP_KEY, groupInfo.getOwnerAppkey());
        result.putInt(Constant.MAX_MEMBER_COUNT, groupInfo.getMaxMemberCount());
        result.putBoolean(Constant.IS_NO_DISTURB, groupInfo.getNoDisturb() == 1);
        result.putBoolean(Constant.IS_BLOCKED, groupInfo.isGroupBlocked() == 1);
        return result;
    }

    public static WritableMap toJSObject(Message msg) {
        WritableMap result = Arguments.createMap();
        try {
            result.putString(Constant.ID, String.valueOf(msg.getId()));
            result.putString(Constant.SERVER_ID, String.valueOf(msg.getServerMessageId()));
            result.putMap(Constant.FROM, toJSObject(msg.getFromUser()));

            if (msg.getDirect() == MessageDirect.send) {
                if (msg.getTargetType() == ConversationType.single) {
                    result.putMap(Constant.TARGET, toJSObject((UserInfo) msg.getTargetInfo()));
                } else if (msg.getTargetType() == ConversationType.group) {
                    result.putMap(Constant.TARGET, toJSObject((GroupInfo) msg.getTargetInfo()));
                }

            } else {
                UserInfo myInfo = JMessageClient.getMyInfo();
                result.putMap(Constant.TARGET, toJSObject(myInfo));
            }

            MessageContent content = msg.getContent();
            if (content.getStringExtras() != null) {
                result.putMap(Constant.EXTRAS, toJSObject(content.getStringExtras()));
            }

            result.putDouble(Constant.CREATE_TIME, msg.getCreateTime());
            result.putInt(Constant.UNRECEIPT_COUNT, msg.getUnreceiptCnt());
            switch (msg.getContentType()) {
                case text:
                    result.putString(Constant.TYPE, Constant.TEXT);
                    result.putString(Constant.TEXT, ((TextContent) content).getText());
                    break;
                case image:
                    result.putString(Constant.TYPE, Constant.IMAGE);
                    ImageContent imageContent = (ImageContent) content;
                    result.putString(Constant.THUMB_PATH, imageContent.getLocalThumbnailPath() + "." + imageContent.getFormat());
                    break;
                case voice:
                    result.putString(Constant.TYPE, Constant.VOICE);
                    VoiceContent voiceContent = (VoiceContent) content;
                    result.putString(Constant.PATH, voiceContent.getLocalPath() + "." + voiceContent.getFormat());
                    result.putInt(Constant.DURATION, ((VoiceContent) content).getDuration());
                    break;
                case file:
                    result.putString(Constant.TYPE, Constant.FILE);
                    FileContent fileContent = (FileContent) content;
                    result.putString(Constant.FILE_NAME, fileContent.getFileName() + "." + fileContent.getFormat());
                    break;
                case custom:
                    result.putString(Constant.TYPE, Constant.CUSTOM);
                    Map<String, String> customObject = ((CustomContent) content).getAllStringValues();
                    result.putMap(Constant.CUSTOM_OBJECT, toJSObject(customObject));
                    break;
                case location:
                    result.putString(Constant.TYPE, Constant.LOCATION);
                    result.putDouble(Constant.LATITUDE, ((LocationContent) content).getLatitude().doubleValue());
                    result.putDouble(Constant.LONGITUDE, ((LocationContent) content).getLongitude().doubleValue());
                    result.putString(Constant.ADDRESS, ((LocationContent) content).getAddress());
                    result.putDouble(Constant.SCALE, ((LocationContent) content).getScale().doubleValue());
                    break;
                case eventNotification:
                    result.putString(Constant.TYPE, "event");
                    List usernameList = ((EventNotificationContent) content).getUserNames();
                    result.putArray(Constant.USERNAMES, toJSArray(usernameList));
                    switch (((EventNotificationContent) content).getEventNotificationType()) {
                        case group_member_added:
                            //群成员加群事件
                            result.putString(Constant.EVENT_TYPE, "group_member_added");
                            break;
                        case group_member_removed:
                            //群成员被踢事件
                            result.putString(Constant.EVENT_TYPE, "group_member_removed");
                            break;
                        case group_member_exit:
                            //群成员退群事件
                            result.putString(Constant.EVENT_TYPE, "group_member_exit");
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
            map.putString(Constant.TITLE, conversation.getTitle());
            map.putString(Constant.CONVERSATION_TYPE, conversation.getType().name());
            map.putInt(Constant.UNREAD_COUNT, conversation.getUnReadMsgCnt());

            if (conversation.getLatestMessage() != null) {
                map.putMap(Constant.LATEST_MESSAGE, toJSObject(conversation.getLatestMessage()));
            }

            if (!TextUtils.isEmpty(conversation.getExtra())) {
                WritableMap extrasMap = Arguments.createMap();
                String extras = conversation.getExtra();
                JsonParser parser = new JsonParser();
                JsonObject jsonObject = parser.parse(extras).getAsJsonObject();
                for (Map.Entry<String, JsonElement> entry : jsonObject.entrySet()) {
                    extrasMap.putString(entry.getKey(), entry.getValue().toString());
                }
                map.putMap(Constant.EXTRAS, extrasMap);
            }

            if (conversation.getType() == ConversationType.single) {
                UserInfo targetInfo = (UserInfo) conversation.getTargetInfo();
                map.putMap(Constant.TARGET, toJSObject(targetInfo));

            } else if (conversation.getType() == ConversationType.group) {
                GroupInfo targetInfo = (GroupInfo) conversation.getTargetInfo();
                map.putMap(Constant.TARGET, toJSObject(targetInfo));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return map;
    }

    public static WritableMap toJSObject(ChatRoomInfo chatRoomInfo, final Callback fail) {
        final WritableMap map = Arguments.createMap();
        try {
            map.putString(Constant.ROOM_ID, String.valueOf(chatRoomInfo.getRoomID()));
            map.putString(Constant.ROOM_NAME, chatRoomInfo.getName());
            map.putString(Constant.APP_KEY, chatRoomInfo.getAppkey());
            chatRoomInfo.getOwnerInfo(new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    if (status == 0) {
                        map.putMap(Constant.OWNER, toJSObject(userInfo));
                    } else {
                        WritableMap result = Arguments.createMap();
                        result.putInt(Constant.CODE, status);
                        result.putString(Constant.DESCRIPTION, desc);
                        fail.invoke(result);
                    }
                }
            });
            map.putInt(Constant.MAX_MEMBER_COUNT, chatRoomInfo.getMaxMemberCount());
            map.putString(Constant.DESCRIPTION, chatRoomInfo.getDescription());
            map.putInt(Constant.TOTAL_MEMBER_COUNT, chatRoomInfo.getTotalMemberCount());
            map.putInt(Constant.CREATE_TIME, chatRoomInfo.getCreateTime());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }

    public static WritableArray toJSArray(List list) {
        WritableArray array = Arguments.createArray();
        if (list != null) {
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
        }

        return array;
    }

    public static WritableArray toJSArray(List<ChatRoomInfo> list, Callback fail) {
        WritableArray array = Arguments.createArray();
        if (null != list) {
            for (ChatRoomInfo chatRoomInfo : list) {
                array.pushMap(toJSObject(chatRoomInfo, fail));
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
