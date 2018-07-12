package io.jchat.android;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.MediaPlayer;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.jpush.JsonObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import cn.jpush.im.android.api.ChatRoomManager;
import cn.jpush.im.android.api.ContactManager;
import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.DownloadCompletionCallback;
import cn.jpush.im.android.api.callback.GetAvatarBitmapCallback;
import cn.jpush.im.android.api.callback.GetBlacklistCallback;
import cn.jpush.im.android.api.callback.GetGroupIDListCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoListCallback;
import cn.jpush.im.android.api.callback.GetGroupMembersCallback;
import cn.jpush.im.android.api.callback.GetNoDisurbListCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.callback.GetUserInfoListCallback;
import cn.jpush.im.android.api.callback.IntegerCallback;
import cn.jpush.im.android.api.callback.ProgressUpdateCallback;
import cn.jpush.im.android.api.callback.RequestCallback;
import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.FileContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.LocationContent;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ContentType;
import cn.jpush.im.android.api.event.ChatRoomMessageEvent;
import cn.jpush.im.android.api.event.ContactNotifyEvent;
import cn.jpush.im.android.api.event.ConversationRefreshEvent;
import cn.jpush.im.android.api.event.GroupApprovalEvent;
import cn.jpush.im.android.api.event.GroupApprovalRefuseEvent;
import cn.jpush.im.android.api.event.GroupApprovedNotificationEvent;
import cn.jpush.im.android.api.event.LoginStateChangeEvent;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.event.MessageRetractEvent;
import cn.jpush.im.android.api.event.NotificationClickEvent;
import cn.jpush.im.android.api.event.OfflineMessageEvent;
import cn.jpush.im.android.api.model.ChatRoomInfo;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupBasicInfo;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.android.api.options.MessageSendingOptions;
import cn.jpush.im.api.BasicCallback;
import io.jchat.android.utils.JMessageUtils;
import io.jchat.android.utils.ResultUtils;

public class JMessageModule extends ReactContextBaseJavaModule {

    private static final String TAG = "JMessageModule";
    private static final String RECEIVE_MSG_EVENT = "JMessage.ReceiveMsgEvent";
    private static final String LOGIN_STATE_CHANGE_EVENT = "JMessage.LoginStateChanged"; //
    private static final String CLICK_NOTIFICATION_EVENT = "JMessage.ClickMessageNotification"; // 点击推送 Android Only
    private static final String SYNC_OFFLINE_EVENT = "JMessage.SyncOfflineMessage"; // 同步离线消息事件
    private static final String SYNC_ROAMING_EVENT = "JMessage.SyncRoamingMessage"; // 同步漫游消息事件
    private static final String RETRACT_MESSAGE_EVENT = "JMessage.MessageRetract"; // 消息撤回事件
    private static final String CONTACT_NOTIFY_EVENT = "JMessage.ContactNotify"; // 收到好友请求消息事件
    private static final String UPLOAD_PROGRESS_EVENT = "JMessage.UploadProgress"; // 上传（图片，文件等）进度事件
    private static final String RECEIVE_CHAT_ROOM_MSG_EVENT = "JMessage.ReceiveChatRoomMsgEvent"; // 收到聊天室消息事件
    private static final String RECEIVE_APPLY_JOIN_GROUP_APPROVAL_EVENT = "JMessage.ReceiveApplyJoinGroupApprovalEvent"; // 接收到入群申请
    private static final String RECEIVE_GROUP_ADMIN_REJECT_EVENT = "JMessage.ReceiveGroupAdminRejectEvent"; // 接收到管理员拒绝入群申请
    private static final String RECEIVE_GROUP_ADMIN_APPROVAL_EVENT = "JMessage.ReceiveGroupAdminApprovalEvent"; // 接收到管理员同意入群申请

    private static final int ERR_CODE_PARAMETER = 1;
    private static final int ERR_CODE_CONVERSATION = 2;
    private static final int ERR_CODE_MESSAGE = 3;
    private static final int ERR_CODE_FILE = 4;

    private static final String ERR_MSG_PARAMETER = "Parameters error";
    private static final String ERR_MSG_CONVERSATION = "Can't get the conversation";
    private static final String ERR_MSG_MESSAGE = "No such message";

    private Context mContext;
    private JMessageUtils mJMessageUtils;
    private HashMap<String, GroupApprovalEvent> groupApprovalEventHashMap;

    public JMessageModule(ReactApplicationContext reactContext, boolean shutdownToast) {
        super(reactContext);
        mJMessageUtils = new JMessageUtils(reactContext, shutdownToast);
        mContext = reactContext;
        groupApprovalEventHashMap = new HashMap<>();
    }

    @Override
    public String getName() {
        return "JMessageModule";
    }

    @Override
    public boolean canOverrideExistingModule() {
        return true;
    }

    @ReactMethod
    public void setup(ReadableMap map) {
        try {
            boolean isOpenMessageRoaming = map.getBoolean(Constant.IS_OPEN_MESSAGE_ROAMING);
            JMessageClient.init(getReactApplicationContext(), isOpenMessageRoaming);
            JMessageClient.registerEventReceiver(this);
        } catch (Exception e) {
            e.printStackTrace();
            Log.d(TAG, "Parameter invalid, please check again");
        }
    }

    @ReactMethod
    public void setDebugMode(ReadableMap map) {
        try {
            boolean enable = map.getBoolean(Constant.ENABLE);
            JMessageClient.setDebugMode(enable);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 启动应用时判断登录状态
     *
     * @param callback callback
     */
    @ReactMethod
    public void isLogin(Callback callback) {
        // 第一次登录需要设置昵称
        boolean flag = SharePreferenceManager.getCachedFixProfileFlag();
        UserInfo myInfo = JMessageClient.getMyInfo();
        WritableMap map = Arguments.createMap();
        String result;
        if (myInfo == null) {
            if (SharePreferenceManager.getCachedUsername() != null) {
                result = "re-login";
                map.putString("username", SharePreferenceManager.getCachedUsername());
            } else {
                result = "login";
            }
        } else if (TextUtils.isEmpty(JMessageClient.getMyInfo().getNickname()) && flag) {
            result = "fillInfo";
        } else {
            result = "mainActivity";
        }
        map.putString("result", result);
        callback.invoke(map);
    }

    // 登录
    @ReactMethod
    public void login(ReadableMap map, final Callback success, final Callback fail) {
        mContext = getCurrentActivity();
        String username = map.getString(Constant.USERNAME);
        String password = map.getString(Constant.PASSWORD);
        Log.i(TAG, "username: " + username + " is logging in");
        JMessageClient.login(username, password, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                mJMessageUtils.handleCallback(status, desc, success, fail);
            }
        });
    }

    // 注册
    @ReactMethod
    public void userRegister(ReadableMap map, final Callback success, final Callback fail) {
        mContext = getCurrentActivity();
        String username = map.getString(Constant.USERNAME);
        String password = map.getString(Constant.PASSWORD);
        Log.i(TAG, "username: " + username + " password: " + password);
        if (TextUtils.isEmpty(username) || TextUtils.isEmpty(password)) {
            Toast.makeText(mContext, "Username or Password null", Toast.LENGTH_SHORT).show();
        } else {
            JMessageClient.register(username, password, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        }
    }

    // 登出
    @ReactMethod
    public void logout() {
        JMessageClient.logout();
    }

    // 返回当前用户信息
    @ReactMethod
    public void getMyInfo(Callback callback) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        callback.invoke(ResultUtils.toJSObject(myInfo));
    }

    @ReactMethod
    public void getUserInfo(ReadableMap map, final Callback success, final Callback fail) {
        String username = map.getString(Constant.USERNAME);
        String appKey = map.getString(Constant.APP_KEY);
        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
            @Override
            public void gotResult(int i, String s, UserInfo userInfo) {
                mJMessageUtils.handleCallbackWithObject(i, s, success, fail, ResultUtils.toJSObject(userInfo));
            }
        });
    }

    @ReactMethod
    public void updateMyPassword(ReadableMap map, final Callback success, final Callback fail) {
        String oldPwd = map.getString(Constant.OLD_PWD);
        String newPwd = map.getString(Constant.NEW_PWD);
        JMessageClient.updateUserPassword(oldPwd, newPwd, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                mJMessageUtils.handleCallback(status, desc, success, fail);
            }
        });
    }

    @ReactMethod
    public void updateMyAvatar(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String path = map.getString("imgPath");
            File file = new File(path);
            if (file.exists() && file.isFile()) {
                JMessageClient.updateUserAvatar(file, new BasicCallback() {
                    @Override
                    public void gotResult(int status, String desc) {
                        mJMessageUtils.handleCallback(status, desc, success, fail);
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void updateMyInfo(ReadableMap map, final Callback success, final Callback fail) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        if (map.hasKey(Constant.NICKNAME)) {
            myInfo.setNickname(map.getString(Constant.NICKNAME));
        }
        if (map.hasKey(Constant.BIRTHDAY)) {
            myInfo.setBirthday((long) map.getDouble(Constant.BIRTHDAY));
        } else {
            myInfo.setBirthday(0);
        }
        if (map.hasKey(Constant.SIGNATURE)) {
            myInfo.setSignature(map.getString(Constant.SIGNATURE));
        }
        if (map.hasKey(Constant.GENDER)) {
            if (map.getString(Constant.GENDER).equals("male")) {
                myInfo.setGender(UserInfo.Gender.male);
            } else if (map.getString(Constant.GENDER).equals("female")) {
                myInfo.setGender(UserInfo.Gender.female);
            } else {
                myInfo.setGender(UserInfo.Gender.unknown);
            }
        }
        if (map.hasKey(Constant.REGION)) {
            myInfo.setRegion(map.getString(Constant.REGION));
        }
        if (map.hasKey(Constant.ADDRESS)) {
            myInfo.setAddress(map.getString(Constant.ADDRESS));
        }
        if (map.hasKey(Constant.EXTRAS)) {
            ReadableMap extras = map.getMap(Constant.EXTRAS);
            ReadableMapKeySetIterator iterator = extras.keySetIterator();
            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();
                myInfo.setUserExtras(key, extras.getString(key));
            }
        }
        JMessageClient.updateMyInfo(UserInfo.Field.all, myInfo, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                mJMessageUtils.handleCallback(status, desc, success, fail);
            }
        });
    }

    @ReactMethod
    public void createSendMessage(ReadableMap map, Callback callback) {
        try {
            MessageContent content;
            Conversation conversation = mJMessageUtils.getConversation(map);
            String type = map.getString(Constant.MESSAGE_TYPE);
            switch (type) {
            case Constant.TEXT:
                content = new TextContent(map.getString(Constant.TEXT));
                break;
            case Constant.IMAGE:
                String path = map.getString(Constant.PATH);
                String suffix = path.substring(path.lastIndexOf(".") + 1);
                content = new ImageContent(new File(path), suffix);
                break;
            case Constant.VOICE:
                path = map.getString(Constant.PATH);
                File file = new File(path);
                MediaPlayer mediaPlayer = MediaPlayer.create(mContext, Uri.parse(path));
                int duration = mediaPlayer.getDuration() / 1000; // Millisecond to second.
                content = new VoiceContent(file, duration);
                mediaPlayer.release();
                break;
            case Constant.FILE:
                path = map.getString(Constant.PATH);
                file = new File(path);
                content = new FileContent(file);
                break;
            case Constant.LOCATION:
                double latitude = map.getDouble(Constant.LATITUDE);
                double longitude = map.getDouble(Constant.LONGITUDE);
                int scale = map.getInt(Constant.SCALE);
                String address = map.getString(Constant.ADDRESS);
                content = new LocationContent(latitude, longitude, scale, address);
                break;
            default:
                content = new CustomContent();
            }
            if (map.hasKey(Constant.EXTRAS)) {
                content.setExtras(ResultUtils.fromMap(map.getMap(Constant.EXTRAS)));
            }
            if (type.equals(Constant.CUSTOM)) {
                CustomContent customContent = new CustomContent();
                customContent.setAllValues(ResultUtils.fromMap(map.getMap(Constant.CUSTOM_OBJECT)));
                Message message = conversation.createSendMessage(customContent);
                callback.invoke(ResultUtils.toJSObject(message));
            } else {
                Message message = conversation.createSendMessage(content);
                callback.invoke(ResultUtils.toJSObject(message));
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(callback, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void sendMessage(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            final Message message = conversation.getMessage(Integer.parseInt(map.getString(Constant.ID)));
            if (map.hasKey(Constant.SENDING_OPTIONS)) {
                MessageSendingOptions options = new MessageSendingOptions();
                ReadableMap optionMap = map.getMap(Constant.SENDING_OPTIONS);
                options.setShowNotification(optionMap.getBoolean("isShowNotification"));
                options.setRetainOffline(optionMap.getBoolean("isRetainOffline"));

                if (optionMap.hasKey("isCustomNotificationEnabled")) {
                    options.setCustomNotificationEnabled(optionMap.getBoolean("isCustomNotificationEnabled"));
                }
                if (optionMap.hasKey("notificationTitle")) {
                    options.setNotificationText(optionMap.getString("notificationTitle"));
                }
                if (optionMap.hasKey("notificationText")) {
                    options.setNotificationText(optionMap.getString("notificationText"));
                }
                JMessageClient.sendMessage(message, options);
            } else {
                JMessageClient.sendMessage(message);
            }
            if (message.getContentType() == ContentType.image || message.getContentType() == ContentType.file) {
                message.setOnContentUploadProgressCallback(new ProgressUpdateCallback() {
                    @Override
                    public void onProgressUpdate(double v) {
                        WritableMap result = Arguments.createMap();
                        result.putInt(Constant.MESSAGE_ID, message.getId());
                        result.putDouble(Constant.PROGRESS, v);
                        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit(UPLOAD_PROGRESS_EVENT, result);
                    }
                });
            }
            message.setOnSendCompleteCallback(new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallbackWithObject(status, desc, success, fail,
                            ResultUtils.toJSObject(message));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void sendTextMessage(ReadableMap map, final Callback success, final Callback fail) {
        TextContent content = new TextContent(map.getString(Constant.TEXT));
        mJMessageUtils.sendMessage(map, content, success, fail);
    }

    @ReactMethod
    public void sendImageMessage(ReadableMap map, Callback success, Callback fail) {
        String path = map.getString(Constant.PATH);
        try {
            String suffix = path.substring(path.lastIndexOf(".") + 1);
            ImageContent content = new ImageContent(new File(path), suffix);
            mJMessageUtils.sendMessage(map, content, success, fail);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_FILE, "No such file");
        }
    }

    @ReactMethod
    public void sendVoiceMessage(ReadableMap map, Callback success, Callback fail) {
        String path = map.getString(Constant.PATH);
        try {
            File file = new File(path);
            MediaPlayer mediaPlayer = MediaPlayer.create(mContext, Uri.parse(path));
            int duration = mediaPlayer.getDuration() / 1000; // Millisecond to second.
            VoiceContent content = new VoiceContent(file, duration);
            mediaPlayer.release();
            mJMessageUtils.sendMessage(map, content, success, fail);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_FILE, "No such file");
        }
    }

    @ReactMethod
    public void sendCustomMessage(ReadableMap map, Callback success, Callback fail) {
        CustomContent content = new CustomContent();
        content.setAllValues(ResultUtils.fromMap(map.getMap(Constant.CUSTOM_OBJECT)));
        mJMessageUtils.sendMessage(map, content, success, fail);
    }

    @ReactMethod
    public void sendLocationMessage(ReadableMap map, Callback success, Callback fail) {
        try {
            double latitude = map.getDouble(Constant.LATITUDE);
            double longitude = map.getDouble(Constant.LONGITUDE);
            int scale = map.getInt(Constant.SCALE);
            String address = map.getString(Constant.ADDRESS);
            LocationContent content = new LocationContent(latitude, longitude, scale, address);
            mJMessageUtils.sendMessage(map, content, success, fail);
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void sendFileMessage(ReadableMap map, Callback success, Callback fail) {
        try {
            String path = map.getString(Constant.PATH);
            FileContent content = new FileContent(new File(path));
            mJMessageUtils.sendMessage(map, content, success, fail);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_FILE, "No such file");
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void retractMessage(ReadableMap map, final Callback success, final Callback fail) {
        Conversation conversation = mJMessageUtils.getConversation(map);
        if (null == conversation) {
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
            return;
        }
        try {
            int msgId = Integer.parseInt(map.getString(Constant.MESSAGE_ID));
            Message msg = conversation.getMessage(msgId);
            conversation.retractMessage(msg, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_MESSAGE);
        }
    }

    @ReactMethod
    public void getHistoryMessages(ReadableMap map, Callback success, Callback fail) {
        Conversation conversation = mJMessageUtils.getConversation(map);
        if (null == conversation) {
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
            return;
        }
        try {
            int from = map.getInt(Constant.FROM);
            int limit = map.getInt(Constant.LIMIT);
            List<Message> messages = conversation.getMessagesFromNewest(from, limit);
            // Is descend 为 false，即默认按照时间顺序排列，2.3.5 新增字段
            boolean isDescend = false;
            if (map.hasKey(Constant.IS_DESCEND)) {
                isDescend = map.getBoolean(Constant.IS_DESCEND);
            }
            if (!isDescend) {
                Collections.reverse(messages);
            }
            success.invoke(ResultUtils.toJSArray(messages));
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, "Unexpected error");
        }
    }

    @ReactMethod
    public void sendInvitationRequest(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String username = map.getString(Constant.USERNAME);
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            String reason = map.getString(Constant.REASON);
            ContactManager.sendInvitationRequest(username, appKey, reason, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void acceptInvitation(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String username = map.getString(Constant.USERNAME);
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            ContactManager.acceptInvitation(username, appKey, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void declineInvitation(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String username = map.getString(Constant.USERNAME);
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            String reason = map.getString(Constant.REASON);
            ContactManager.declineInvitation(username, appKey, reason, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void removeFromFriendList(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String username = map.getString(Constant.USERNAME);
            String appKey = map.getString(Constant.APP_KEY);
            JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    if (status == 0) {
                        userInfo.removeFromFriendList(new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                mJMessageUtils.handleCallback(status, desc, success, fail);
                            }
                        });
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void updateFriendNoteName(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String username = map.getString(Constant.USERNAME);
            String appKey = map.getString(Constant.APP_KEY);
            final String noteName = map.getString(Constant.NOTE_NAME);
            JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    if (status == 0) {
                        userInfo.updateNoteName(noteName, new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                mJMessageUtils.handleCallback(status, desc, success, fail);
                            }
                        });
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void updateFriendNoteText(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String username = map.getString(Constant.USERNAME);
            String appKey = map.getString(Constant.APP_KEY);
            final String noteText = map.getString(Constant.NOTE_TEXT);
            JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    if (status == 0) {
                        userInfo.updateNoteText(noteText, new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                mJMessageUtils.handleCallback(status, desc, success, fail);
                            }
                        });
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getFriends(final Callback success, final Callback fail) {
        ContactManager.getFriendList(new GetUserInfoListCallback() {
            @Override
            public void gotResult(int status, String desc, List<UserInfo> list) {
                mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, ResultUtils.toJSArray(list));
            }
        });
    }

    @ReactMethod
    public void createGroup(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String name = map.getString(Constant.NAME);
            String desc = map.getString(Constant.DESC);
            String groupType = map.getString(Constant.GROUP_TYPE);
            if (groupType.equals("private")) {
                JMessageClient.createGroup(name, desc, new CreateGroupCallback() {
                    @Override
                    public void gotResult(int status, String desc, long groupId) {
                        mJMessageUtils.handleCallbackWithValue(status, desc, success, fail, String.valueOf(groupId));
                    }
                });
            } else if (groupType.equals("public")) {
                JMessageClient.createPublicGroup(name, desc, new CreateGroupCallback() {
                    @Override
                    public void gotResult(int status, String desc, long groupId) {
                        mJMessageUtils.handleCallbackWithValue(status, desc, success, fail, String.valueOf(groupId));
                    }
                });
            } else {
                mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER + " : " + groupType);
            }

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getGroupIds(final Callback success, final Callback fail) {
        JMessageClient.getGroupIDList(new GetGroupIDListCallback() {
            @Override
            public void gotResult(int status, String desc, List<Long> list) {
                mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, ResultUtils.toJSArray(list));
            }
        });
    }

    @ReactMethod
    public void getGroupInfo(ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.ID));
            JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, GroupInfo groupInfo) {
                    mJMessageUtils.handleCallbackWithObject(status, desc, success, fail,
                            ResultUtils.toJSObject(groupInfo));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void updateGroupInfo(ReadableMap map, final Callback success, final Callback fail) {
        try {
            final long groupId = Long.parseLong(map.getString(Constant.ID));
            String newName = map.hasKey(Constant.NEW_NAME) ? map.getString(Constant.NEW_NAME) : "";
            final String newDesc = map.hasKey(Constant.NEW_DESC) ? map.getString(Constant.NEW_DESC) : "";
            if (!TextUtils.isEmpty(newName) && !TextUtils.isEmpty(newDesc)) {
                JMessageClient.updateGroupName(groupId, newName, new BasicCallback() {
                    @Override
                    public void gotResult(int status, String desc) {
                        if (status == 0) {
                            JMessageClient.updateGroupDescription(groupId, newDesc, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    mJMessageUtils.handleCallback(status, desc, success, fail);
                                }
                            });
                        } else {
                            mJMessageUtils.handleError(fail, status, desc);
                        }
                    }
                });
                return;
            }
            if (!TextUtils.isEmpty(newName) && TextUtils.isEmpty(newDesc)) {
                JMessageClient.updateGroupName(groupId, newName, new BasicCallback() {
                    @Override
                    public void gotResult(int status, String desc) {
                        mJMessageUtils.handleCallback(status, desc, success, fail);
                    }
                });
                return;
            }
            if (TextUtils.isEmpty(newName) && !TextUtils.isEmpty(newDesc)) {
                JMessageClient.updateGroupDescription(groupId, newDesc, new BasicCallback() {
                    @Override
                    public void gotResult(int status, String desc) {
                        mJMessageUtils.handleCallback(status, desc, success, fail);
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void addGroupMembers(ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.ID));
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            ReadableArray array = map.getArray(Constant.USERNAME_ARRAY);
            List<String> usernameList = new ArrayList<String>();
            for (int i = 0; i < array.size(); i++) {
                usernameList.add(array.getString(i));
            }
            JMessageClient.addGroupMembers(groupId, appKey, usernameList, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void removeGroupMembers(ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.ID));
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            ReadableArray array = map.getArray(Constant.USERNAME_ARRAY);
            List<String> usernameList = new ArrayList<String>();
            for (int i = 0; i < array.size(); i++) {
                usernameList.add(array.getString(i));
            }
            JMessageClient.removeGroupMembers(groupId, appKey, usernameList, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void exitGroup(ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.ID));
            JMessageClient.exitGroup(groupId, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getGroupMembers(ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.ID));
            JMessageClient.getGroupMembers(groupId, new GetGroupMembersCallback() {
                @Override
                public void gotResult(int status, String desc, List<UserInfo> list) {
                    mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, ResultUtils.toJSArray(list));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void addUsersToBlacklist(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            ReadableArray array = map.getArray(Constant.USERNAME_ARRAY);
            List<String> usernameList = new ArrayList<String>();
            for (int i = 0; i < array.size(); i++) {
                usernameList.add(array.getString(i));
            }
            JMessageClient.addUsersToBlacklist(usernameList, appKey, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void removeUsersFromBlacklist(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            ReadableArray array = map.getArray(Constant.USERNAME_ARRAY);
            List<String> usernameList = new ArrayList<String>();
            for (int i = 0; i < array.size(); i++) {
                usernameList.add(array.getString(i));
            }
            JMessageClient.delUsersFromBlacklist(usernameList, appKey, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getBlacklist(final Callback success, final Callback fail) {
        try {
            JMessageClient.getBlacklist(new GetBlacklistCallback() {
                @Override
                public void gotResult(int status, String desc, List<UserInfo> list) {
                    mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, ResultUtils.toJSArray(list));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void setNoDisturb(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String type = map.getString(Constant.TYPE);
            final int isNoDisturb = map.getBoolean(Constant.IS_NO_DISTURB) ? 1 : 0;
            if (type.equals(Constant.TYPE_SINGLE)) {
                String username = map.getString(Constant.USERNAME);
                String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
                JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
                    @Override
                    public void gotResult(int status, String desc, UserInfo userInfo) {
                        if (status == 0) {
                            userInfo.setNoDisturb(isNoDisturb, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    mJMessageUtils.handleCallback(status, desc, success, fail);
                                }
                            });
                        } else {
                            mJMessageUtils.handleError(fail, status, desc);
                        }
                    }
                });
            } else {
                long groupId = Long.parseLong(map.getString(Constant.ID));
                JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
                    @Override
                    public void gotResult(int status, String desc, GroupInfo groupInfo) {
                        if (status == 0) {
                            groupInfo.setNoDisturb(isNoDisturb, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    mJMessageUtils.handleCallback(status, desc, success, fail);
                                }
                            });
                        } else {
                            mJMessageUtils.handleError(fail, status, desc);
                        }
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getNoDisturbList(final Callback success, final Callback fail) {
        JMessageClient.getNoDisturblist(new GetNoDisurbListCallback() {
            @Override
            public void gotResult(int status, String desc, List<UserInfo> userInfos, List<GroupInfo> groupInfos) {
                if (status == 0) {
                    WritableMap map = Arguments.createMap();
                    map.putArray(Constant.USER_INFO_ARRAY, ResultUtils.toJSArray(userInfos));
                    map.putArray(Constant.GROUP_INFO_ARRAY, ResultUtils.toJSArray(groupInfos));
                    mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, map);
                } else {
                    mJMessageUtils.handleError(fail, status, desc);
                }
            }
        });
    }

    @ReactMethod
    public void setNoDisturbGlobal(ReadableMap map, final Callback success, final Callback fail) {
        try {
            final int isNoDisturb = map.getBoolean(Constant.IS_NO_DISTURB) ? 1 : 0;
            JMessageClient.setNoDisturbGlobal(isNoDisturb, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void isNoDisturbGlobal(final Callback success, final Callback fail) {
        JMessageClient.getNoDisturbGlobal(new IntegerCallback() {
            @Override
            public void gotResult(int status, String desc, Integer integer) {
                WritableMap map = Arguments.createMap();
                map.putBoolean(Constant.IS_NO_DISTURB, integer == 1);
                mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, map);
            }
        });
    }

    @ReactMethod
    public void downloadOriginalUserAvatar(ReadableMap map, final Callback success, final Callback fail) {
        final String username = map.getString(Constant.USERNAME);
        final String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
        JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    userInfo.getBigAvatarBitmap(new GetAvatarBitmapCallback() {
                        @Override
                        public void gotResult(int status, String desc, Bitmap bitmap) {
                            if (status == 0) {
                                String packageName = mContext.getPackageName();
                                String fileName = username + appKey + "original";
                                String path = mJMessageUtils.storeImage(bitmap, fileName, packageName);
                                WritableMap result = Arguments.createMap();
                                result.putString(Constant.FILE_PATH, path);
                                mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                            } else {
                                mJMessageUtils.handleError(fail, status, desc);
                            }
                        }
                    });
                } else {
                    mJMessageUtils.handleError(fail, status, desc);
                }
            }
        });
    }

    @ReactMethod
    public void downloadOriginalImage(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (null == conversation) {
                mJMessageUtils.handleError(fail, ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION);
                return;
            }
            final String messageId = map.getString(Constant.MESSAGE_ID);
            Message msg = conversation.getMessage(Integer.parseInt(messageId));
            if (null == msg) {
                mJMessageUtils.handleError(fail, ERR_CODE_MESSAGE, ERR_MSG_MESSAGE);
                return;
            }
            if (msg.getContentType() != ContentType.image) {
                mJMessageUtils.handleError(fail, ERR_CODE_MESSAGE, "Wrong message type");
                return;
            }
            ImageContent content = (ImageContent) msg.getContent();
            content.downloadOriginImage(msg, new DownloadCompletionCallback() {
                @Override
                public void onComplete(int status, String desc, File file) {
                    if (status == 0) {
                        WritableMap result = Arguments.createMap();
                        result.putString(Constant.MESSAGE_ID, messageId);
                        result.putString(Constant.FILE_PATH, file.getAbsolutePath());
                        mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void downloadVoiceFile(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (null == conversation) {
                mJMessageUtils.handleError(fail, ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION);
                return;
            }
            final String messageId = map.getString(Constant.MESSAGE_ID);
            Message msg = conversation.getMessage(Integer.parseInt(messageId));
            if (null == msg) {
                mJMessageUtils.handleError(fail, ERR_CODE_MESSAGE, ERR_MSG_MESSAGE);
                return;
            }
            if (msg.getContentType() != ContentType.image) {
                mJMessageUtils.handleError(fail, ERR_CODE_MESSAGE, "Wrong message type");
                return;
            }
            VoiceContent content = (VoiceContent) msg.getContent();
            content.downloadVoiceFile(msg, new DownloadCompletionCallback() {
                @Override
                public void onComplete(int status, String desc, File file) {
                    if (status == 0) {
                        WritableMap result = Arguments.createMap();
                        result.putString(Constant.MESSAGE_ID, messageId);
                        result.putString(Constant.FILE_PATH, file.getAbsolutePath());
                        mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void downloadFile(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (null == conversation) {
                mJMessageUtils.handleError(fail, ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION);
                return;
            }
            final String messageId = map.getString(Constant.MESSAGE_ID);
            Message msg = conversation.getMessage(Integer.parseInt(messageId));
            if (null == msg) {
                mJMessageUtils.handleError(fail, ERR_CODE_MESSAGE, ERR_MSG_MESSAGE);
                return;
            }
            FileContent content = (FileContent) msg.getContent();
            content.downloadFile(msg, new DownloadCompletionCallback() {
                @Override
                public void onComplete(int status, String desc, File file) {
                    if (status == 0) {
                        WritableMap result = Arguments.createMap();
                        result.putString(Constant.MESSAGE_ID, messageId);
                        result.putString(Constant.FILE_PATH, file.getAbsolutePath());
                        mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void createConversation(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (null != conversation) {
                mJMessageUtils.handleCallbackWithObject(0, "", success, fail, ResultUtils.toJSObject(conversation));
            } else {
                mJMessageUtils.handleError(fail, ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION);
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void deleteConversation(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String type = map.getString(Constant.TYPE);
            if (type.equals(Constant.TYPE_SINGLE)) {
                String username = map.getString(Constant.USERNAME);
                String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
                JMessageClient.deleteSingleConversation(username, appKey);
            } else if (type.equals(Constant.TYPE_GROUP)) {
                long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
                JMessageClient.deleteGroupConversation(groupId);
            } else {
                String roomId = map.getString(Constant.ROOM_ID);
                JMessageClient.deleteChatRoomConversation(Long.parseLong(roomId));
            }
            mJMessageUtils.handleCallback(0, "", success, fail);
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void enterConversation(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String type = map.getString(Constant.TYPE);
            if (type.equals(Constant.TYPE_SINGLE)) {
                String username = map.getString(Constant.USERNAME);
                String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
                JMessageClient.enterSingleConversation(username, appKey);
            } else if (type.equals(Constant.TYPE_GROUP)) {
                long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
                JMessageClient.enterGroupConversation(groupId);
            }
            mJMessageUtils.handleCallback(0, "", success, fail);
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void exitConversation() {
        JMessageClient.exitConversation();
    }

    @ReactMethod
    public void getConversation(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (null != conversation) {
                mJMessageUtils.handleCallbackWithObject(0, "", success, fail, ResultUtils.toJSObject(conversation));
            } else {
                mJMessageUtils.handleError(fail, ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION);
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getConversations(Callback success, Callback fail) {
        List<Conversation> list = JMessageClient.getConversationList();
        success.invoke(ResultUtils.toJSArray(list));
    }

    @ReactMethod
    public void resetUnreadMessageCount(ReadableMap map, Callback success, Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (null != conversation) {
                conversation.resetUnreadCount();
                success.invoke(0);
            } else {
                mJMessageUtils.handleError(fail, ERR_CODE_CONVERSATION, ERR_MSG_CONVERSATION);
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void downloadThumbUserAvatar(ReadableMap map, final Callback success, final Callback fail) {
        try {
            final String username = map.getString(Constant.USERNAME);
            final String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            JMessageClient.getUserInfo(username, appKey, new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    if (status == 0) {
                        if (userInfo.getAvatar() != null) {
                            File file = userInfo.getAvatarFile();
                            WritableMap result = Arguments.createMap();
                            result.putString(Constant.USERNAME, username);
                            result.putString(Constant.APP_KEY, appKey);
                            result.putString(Constant.FILE_PATH, file.getAbsolutePath());
                            mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                        }
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void isGroupBlocked(ReadableMap map, final Callback success, final Callback fail) {
        try {
            String groupId = map.getString(Constant.GROUP_ID);
            JMessageClient.getGroupInfo(Long.parseLong(groupId), new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, GroupInfo groupInfo) {
                    if (status == 0) {
                        boolean isBlocked = groupInfo.isGroupBlocked() == 1;
                        WritableMap result = Arguments.createMap();
                        result.putBoolean(Constant.IS_BLOCKED, isBlocked);
                        mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getBlockedGroupList(final Callback success, final Callback fail) {
        JMessageClient.getBlockedGroupsList(new GetGroupInfoListCallback() {
            @Override
            public void gotResult(int status, String desc, List<GroupInfo> list) {
                if (status == 0) {
                    WritableArray array = Arguments.createArray();
                    for (GroupInfo groupInfo : list) {
                        array.pushMap(ResultUtils.toJSObject(groupInfo));
                    }
                    mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, array);
                } else {
                    mJMessageUtils.handleError(fail, status, desc);
                }
            }
        });
    }

    @ReactMethod
    public void updateGroupAvatar(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            String groupId = map.getString(Constant.GROUP_ID);
            JMessageClient.getGroupInfo(Long.parseLong(groupId), new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, GroupInfo groupInfo) {
                    if (status == 0) {
                        String path = map.getString("imgPath");
                        String format = path.substring(path.lastIndexOf(".") + 1);
                        File file = new File(path);
                        if (file.exists()) {
                            groupInfo.updateAvatar(file, format, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    mJMessageUtils.handleCallback(status, desc, success, fail);
                                }
                            });
                        } else {
                            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, "File is not exist!");
                        }
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void downloadThumbGroupAvatar(ReadableMap map, final Callback success, final Callback fail) {
        try {
            final String groupId = map.getString(Constant.GROUP_ID);
            JMessageClient.getGroupInfo(Long.parseLong(groupId), new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, final GroupInfo groupInfo) {
                    if (status == 0) {
                        if (groupInfo.getAvatar() != null) {
                            File file = groupInfo.getAvatarFile();
                            final WritableMap result = Arguments.createMap();
                            result.putString(Constant.ID, groupId);
                            if (file.exists()) {
                                result.putString(Constant.FILE_PATH, file.getAbsolutePath());
                                mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                            } else {
                                groupInfo.getAvatarBitmap(new GetAvatarBitmapCallback() {
                                    @Override
                                    public void gotResult(int status, String desc, Bitmap bitmap) {
                                        if (status == 0) {
                                            String fileName = groupId + groupInfo.getGroupName();
                                            String path = mJMessageUtils.storeImage(bitmap, fileName,
                                                    mContext.getPackageName());
                                            result.putString(Constant.FILE_PATH, path);
                                        } else {
                                            mJMessageUtils.handleError(fail, status, desc);
                                        }
                                    }
                                });
                            }
                        }
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void downloadOriginalGroupAvatar(ReadableMap map, final Callback success, final Callback fail) {
        try {
            final String groupId = map.getString(Constant.GROUP_ID);
            JMessageClient.getGroupInfo(Long.parseLong(groupId), new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, final GroupInfo groupInfo) {
                    if (status == 0) {
                        if (groupInfo.getAvatar() != null) {
                            File file = groupInfo.getBigAvatarFile();
                            final WritableMap result = Arguments.createMap();
                            result.putString(Constant.ID, groupId);
                            if (file.exists()) {
                                result.putString(Constant.FILE_PATH, file.getAbsolutePath());
                                mJMessageUtils.handleCallbackWithObject(status, desc, success, fail, result);
                            } else {
                                groupInfo.getBigAvatarBitmap(new GetAvatarBitmapCallback() {
                                    @Override
                                    public void gotResult(int status, String desc, Bitmap bitmap) {
                                        if (status == 0) {
                                            String fileName = groupId + groupInfo.getGroupName() + "original";
                                            String path = mJMessageUtils.storeImage(bitmap, fileName,
                                                    mContext.getPackageName());
                                            result.putString(Constant.FILE_PATH, path);
                                        } else {
                                            mJMessageUtils.handleError(fail, status, desc);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void setConversationExtras(ReadableMap map, Callback success, Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            ReadableMap extraMap = map.getMap(Constant.EXTRAS);
            ReadableMapKeySetIterator iterator = extraMap.keySetIterator();
            JsonObject jsonObject = new JsonObject();
            while (iterator.hasNextKey()) {
                String key = iterator.nextKey();
                jsonObject.addProperty(key, extraMap.getString(key));
            }
            conversation.updateConversationExtra(jsonObject.toString());
            Log.e("JMessageModule", "extra : " + jsonObject.toString());
            WritableMap result = ResultUtils.toJSObject(conversation);
            mJMessageUtils.handleCallbackWithObject(0, "Set extra succeed", success, fail, result);
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void forwardMessage(ReadableMap map, final Callback success, final Callback fail) {
        try {
            Conversation conversation = mJMessageUtils.getConversation(map);
            if (conversation != null) {
                Message message = conversation.getMessage(Integer.parseInt(map.getString(Constant.ID)));
                MessageSendingOptions options = null;
                if (map.hasKey(Constant.SENDING_OPTIONS)) {
                    options = new MessageSendingOptions();
                    ReadableMap optionMap = map.getMap(Constant.SENDING_OPTIONS);
                    options.setShowNotification(optionMap.getBoolean("isShowNotification"));
                    options.setRetainOffline(optionMap.getBoolean("isRetainOffline"));

                    if (optionMap.hasKey("isCustomNotificationEnabled")) {
                        options.setCustomNotificationEnabled(optionMap.getBoolean("isCustomNotificationEnabled"));
                    }
                    if (optionMap.hasKey("notificationTitle")) {
                        options.setNotificationText(optionMap.getString("notificationTitle"));
                    }
                    if (optionMap.hasKey("notificationText")) {
                        options.setNotificationText(optionMap.getString("notificationText"));
                    }
                }
                ReadableMap target = map.getMap(Constant.TARGET);
                String type = target.getString(Constant.TYPE);
                Conversation targetConversation = null;
                if (type.equals(Constant.TYPE_USER)) {
                    String username = map.getString(Constant.USERNAME);
                    String appKey = "";
                    if (map.hasKey(Constant.APP_KEY)) {
                        appKey = map.getString(Constant.APP_KEY);
                    }
                    targetConversation = Conversation.createSingleConversation(username, appKey);
                } else {
                    String groupId = map.getString(Constant.GROUP_ID);
                    targetConversation = Conversation.createGroupConversation(Long.parseLong(groupId));
                }
                JMessageClient.forwardMessage(message, targetConversation, options, new BasicCallback() {
                    @Override
                    public void gotResult(int status, String desc) {
                        mJMessageUtils.handleCallback(status, desc, success, fail);
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    /**
     * 查询当前应用 AppKey 下的聊天室信息
     *
     * @param param   包含起始位置，获取个数
     * @param success 成功回调
     * @param fail    失败回调
     */
    @ReactMethod
    public void getChatRoomListByApp(ReadableMap param, final Callback success, final Callback fail) {
        try {
            int start = param.getInt("start");
            int count = param.getInt("count");
            ChatRoomManager.getChatRoomListByApp(start, count, new RequestCallback<List<ChatRoomInfo>>() {
                @Override
                public void gotResult(int status, String desc, List<ChatRoomInfo> chatRoomInfos) {
                    mJMessageUtils.handleCallbackWithArray(status, desc, success, fail,
                            ResultUtils.toJSArray(chatRoomInfos));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    /**
     * 获取当前用户所加入的所有聊天室信息
     *
     * @param success 成功回调
     * @param fail    失败回调
     */
    @ReactMethod
    public void getChatRoomListByUser(final Callback success, final Callback fail) {
        ChatRoomManager.getChatRoomListByUser(new RequestCallback<List<ChatRoomInfo>>() {
            @Override
            public void gotResult(int status, String desc, List<ChatRoomInfo> list) {
                mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, ResultUtils.toJSArray(list));
            }
        });
    }

    /**
     * 查询指定 roomId 聊天室信息
     * 
     * @param map     包含待查询 roomId
     * @param success 成功回调
     * @param fail    失败回调
     */
    @ReactMethod
    public void getChatRoomInfos(ReadableMap map, final Callback success, final Callback fail) {
        try {
            ReadableArray array = map.getArray(Constant.ROOM_IDS);
            Set<Long> idSet = new HashSet<>();
            for (int i = 0; i < array.size() - 1; i++) {
                long id = Long.parseLong(array.getString(i));
                idSet.add(id);
            }
            ChatRoomManager.getChatRoomInfos(idSet, new RequestCallback<List<ChatRoomInfo>>() {
                @Override
                public void gotResult(int status, String desc, List<ChatRoomInfo> list) {
                    mJMessageUtils.handleCallbackWithArray(status, desc, success, fail, ResultUtils.toJSArray(list));
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    /**
     * 获取聊天室拥有者 UserInfo
     * 
     * @param map     包含聊天室 id
     * @param success 成功回调
     * @param fail    失败回调
     */
    @ReactMethod
    public void getChatRoomOwner(ReadableMap map, final Callback success, final Callback fail) {
        try {
            long id = Long.parseLong(map.getString(Constant.ROOM_ID));
            Set<Long> set = new HashSet<>();
            set.add(id);
            ChatRoomManager.getChatRoomInfos(set, new RequestCallback<List<ChatRoomInfo>>() {
                @Override
                public void gotResult(int status, String desc, List<ChatRoomInfo> list) {
                    list.get(0).getOwnerInfo(new GetUserInfoCallback() {
                        @Override
                        public void gotResult(int status, String desc, UserInfo userInfo) {
                            mJMessageUtils.handleCallbackWithObject(status, desc, success, fail,
                                    ResultUtils.toJSObject(userInfo));
                        }
                    });
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    /**
     * 进入聊天室，进入后才能收到聊天室信息及发言
     * 
     * @param map     包含聊天室 id
     * @param success 成功回调
     * @param fail    失败回调
     */
    @ReactMethod
    public void enterChatRoom(ReadableMap map, final Callback success, final Callback fail) {
        ChatRoomManager.enterChatRoom(Long.parseLong(map.getString(Constant.ROOM_ID)),
                new RequestCallback<Conversation>() {
                    @Override
                    public void gotResult(int status, String desc, Conversation conversation) {
                        mJMessageUtils.handleCallbackWithObject(status, desc, success, fail,
                                ResultUtils.toJSObject(conversation));
                    }
                });
    }

    /**
     * 离开聊天室
     * 
     * @param map     包含聊天室 id
     * @param success 成功回调
     * @param fail    失败回调
     */
    @ReactMethod
    public void leaveChatRoom(ReadableMap map, final Callback success, final Callback fail) {
        ChatRoomManager.leaveChatRoom(Long.parseLong(map.getString(Constant.ROOM_ID)), new BasicCallback() {
            @Override
            public void gotResult(int i, String s) {
                mJMessageUtils.handleCallback(i, s, success, fail);
            }
        });
    }

    /**
     * 从本地获取用户的聊天室会话列表，没有则返回为空的列表
     * 
     * @param success 成功回调
     */
    @ReactMethod
    public void getChatRoomConversationList(Callback success) {
        List<Conversation> list = JMessageClient.getChatRoomConversationList();
        success.invoke(ResultUtils.toJSArray(list));
    }

    /**
     * 删除聊天室会话，同时删除本地相关缓存文件。成功返回 true，失败返回 false
     * 
     * @param roomId 聊天室 id
     */
    @ReactMethod
    public void deleteChatRoomConversation(String roomId, Callback success) {
        success.invoke(JMessageClient.deleteChatRoomConversation(Long.parseLong(roomId)));
    }

    /**
     * 创建聊天室会话，如果本地已存在，则不会重新创建，直接返回该会话
     * 
     * @param roomId 聊天室 id
     */
    @ReactMethod
    public void createChatRoomConversation(String roomId, Callback success) {
        Conversation conversation = Conversation.createChatRoomConversation(Long.parseLong(roomId));
        success.invoke(ResultUtils.toJSObject(conversation));
    }

    /**
     * 获取所有回话未读消息总数
     * 
     * @param success 成功回调
     */
    @ReactMethod
    public void getAllUnreadCount(Callback success) {
        WritableMap map = Arguments.createMap();
        int count = JMessageClient.getAllUnReadMsgCount();
        map.putInt("count", count);
        success.invoke(map);
    }

    @ReactMethod
    public void addGroupAdmins(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
            JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, GroupInfo groupInfo) {
                    if (status == 0) {
                        String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
                        ReadableArray array = map.getArray(Constant.USERNAMES);
                        final List<UserInfo> userInfos = new ArrayList<>();
                        for (int i = 0; i < array.size(); i++) {
                            userInfos.add(groupInfo.getGroupMemberInfo(array.getString(i), appKey));
                        }
                        groupInfo.addGroupKeeper(userInfos, new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                mJMessageUtils.handleCallback(status, desc, success, fail);
                            }
                        });
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void removeGroupAdmins(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
            JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, GroupInfo groupInfo) {
                    if (status == 0) {
                        String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
                        ReadableArray array = map.getArray(Constant.USERNAMES);
                        final List<UserInfo> userInfos = new ArrayList<>();
                        for (int i = 0; i < array.size(); i++) {
                            userInfos.add(groupInfo.getGroupMemberInfo(array.getString(i), appKey));
                        }
                        groupInfo.removeGroupKeeper(userInfos, new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                mJMessageUtils.handleCallback(status, desc, success, fail);
                            }
                        });
                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void changeGroupType(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));

            JMessageClient.getGroupInfo(groupId, new GetGroupInfoCallback() {
                @Override
                public void gotResult(int status, String desc, GroupInfo groupInfo) {
                    if (status == 0) {
                        String type = map.getString(Constant.TYPE);
                        if (type.equals("private")) {
                            groupInfo.changeGroupType(GroupInfo.Type.private_group, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    mJMessageUtils.handleCallback(status, desc, success, fail);
                                }
                            });
                        } else if (type.equals("public")) {
                            groupInfo.changeGroupType(GroupInfo.Type.public_group, new BasicCallback() {
                                @Override
                                public void gotResult(int status, String desc) {
                                    mJMessageUtils.handleCallback(status, desc, success, fail);
                                }
                            });
                        } else {
                            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
                        }

                    } else {
                        mJMessageUtils.handleError(fail, status, desc);
                    }
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void getPublicGroupInfos(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            String appKey = map.hasKey(Constant.APP_KEY) ? map.getString(Constant.APP_KEY) : "";
            int start = Integer.parseInt(map.getString(Constant.START));
            int count = Integer.parseInt(map.getString(Constant.COUNT));
            String reason = map.getString(Constant.REASON);
            JMessageClient.getPublicGroupListByApp(appKey, start, count, new RequestCallback<List<GroupBasicInfo>>() {
                @Override
                public void gotResult(int status, String desc, List<GroupBasicInfo> groupBasicInfos) {
                    mJMessageUtils.handleCallbackWithArray(status, desc, success, fail,
                            ResultUtils.toJSArray(groupBasicInfos));
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void applyJoinGroup(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
            String reason = map.getString(Constant.REASON);
            JMessageClient.applyJoinGroup(groupId, reason, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void processApplyJoinGroup(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            String reason = map.getString(Constant.REASON);
            Boolean isAgree = map.getBoolean(Constant.IS_AGREE);
            Boolean isRespondInviter = map.getBoolean(Constant.IS_RESPOND_INVITER);
            ReadableArray array = map.getArray(Constant.EVENTS);

            List<GroupApprovalEvent> groupApprovalEventList = new ArrayList<>();

            for (int i = 0; i < array.size(); i++) {
                GroupApprovalEvent groupApprovalEvent = groupApprovalEventHashMap.get(array.getString(i));
                if (groupApprovalEvent == null) {
                    mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER,
                            ERR_MSG_PARAMETER + ": can't get event through " + array.getString(i));
                    return;
                }
                groupApprovalEventList.add(groupApprovalEvent);

            }
            if (groupApprovalEventList.size() == 0) {
                mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, "Can not find GroupApprovalEvent by events");
                return;
            }
            if (isAgree) {
                GroupApprovalEvent.acceptGroupApprovalInBatch(groupApprovalEventList, isRespondInviter,
                        new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                mJMessageUtils.handleCallback(status, desc, success, fail);
                            }
                        });

            } else {
                // 忽略拒绝处理，直接返回成功信息
                mJMessageUtils.handleCallback(0, "", success, fail);
            }
        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    @ReactMethod
    public void dissolveGroup(final ReadableMap map, final Callback success, final Callback fail) {
        try {
            long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
            JMessageClient.adminDissolveGroup(groupId, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mJMessageUtils.handleCallback(status, desc, success, fail);
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
            mJMessageUtils.handleError(fail, ERR_CODE_PARAMETER, ERR_MSG_PARAMETER);
        }
    }

    public void onEvent(LoginStateChangeEvent event) {
        Log.d(TAG, "登录状态改变事件：event = " + event.toString());
        WritableMap map = Arguments.createMap();
        map.putString(Constant.TYPE, event.getReason().toString());
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(LOGIN_STATE_CHANGE_EVENT, map);
    }

    public void onEvent(MessageEvent event) {
        Message msg = event.getMessage();
        Log.d(TAG, "收到消息：msg = " + msg.toString());
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RECEIVE_MSG_EVENT, ResultUtils.toJSObject(msg));
    }

    /**
     * 漫游消息同步事件。
     *
     * @param event 漫游消息同步事件。
     */
    public void onEvent(ConversationRefreshEvent event) {
        if (event.getReason() == ConversationRefreshEvent.Reason.MSG_ROAMING_COMPLETE) {
            WritableMap map = Arguments.createMap();
            map.putMap(Constant.CONVERSATION, ResultUtils.toJSObject(event.getConversation()));
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(SYNC_ROAMING_EVENT, map);
        }
    }

    public void onEvent(ContactNotifyEvent event) {
        Log.d(TAG, "ContactNotifyEvent, event: " + event);
        WritableMap map = Arguments.createMap();
        map.putString(Constant.TYPE, event.getType().toString());
        map.putString(Constant.REASON, event.getReason());
        map.putString(Constant.FROM_USERNAME, event.getFromUsername());
        map.putString(Constant.FROM_USER_APP_KEY, event.getfromUserAppKey());
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(CONTACT_NOTIFY_EVENT, map);
    }

    public void onEvent(MessageRetractEvent event) {
        WritableMap map = Arguments.createMap();
        map.putMap(Constant.CONVERSATION, ResultUtils.toJSObject(event.getConversation()));
        map.putMap(Constant.RETRACT_MESSAGE, ResultUtils.toJSObject(event.getRetractedMessage()));
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RETRACT_MESSAGE_EVENT, map);
    }

    public void onEvent(NotificationClickEvent event) {
        try {
            Intent launchIntent = mContext.getApplicationContext().getPackageManager()
                    .getLaunchIntentForPackage(mContext.getPackageName());
            launchIntent.setFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            mContext.startActivity(launchIntent);
            WritableMap map = Arguments.createMap();
            map.putMap(Constant.MESSAGE, ResultUtils.toJSObject(event.getMessage()));
            getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(CLICK_NOTIFICATION_EVENT, map);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void onEvent(OfflineMessageEvent event) {
        final List<Message> offlineMsgList = event.getOfflineMessageList();
        if (offlineMsgList.size() > 0) {
            final WritableMap map = Arguments.createMap();
            map.putMap(Constant.CONVERSATION, ResultUtils.toJSObject(event.getConversation()));
            int lastMediaMsgIndex = -1;
            for (int i = offlineMsgList.size() - 1; i >= 0; i--) {
                Message message = offlineMsgList.get(i);
                if (message.getContentType() == ContentType.image || message.getContentType() == ContentType.voice) {
                    lastMediaMsgIndex = i;
                    break;
                }
            }
            final WritableArray msgArray = Arguments.createArray();
            if (lastMediaMsgIndex == -1) {
                for (Message msg : offlineMsgList) {
                    msgArray.pushMap(ResultUtils.toJSObject(msg));
                }
                map.putArray(Constant.MESSAGE_ARRAY, msgArray);
                getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(SYNC_OFFLINE_EVENT, map);
            } else {
                final int fLastMediaMsgIndex = lastMediaMsgIndex;

                for (int i = 0; i < offlineMsgList.size(); i++) {
                    Message msg = offlineMsgList.get(i);

                    final int fI = i;

                    switch (msg.getContentType()) {
                    case image:
                        ((ImageContent) msg.getContent()).downloadThumbnailImage(msg, new DownloadCompletionCallback() {
                            @Override
                            public void onComplete(int status, String desc, File file) {
                                if (fI == fLastMediaMsgIndex) {
                                    for (Message msg : offlineMsgList) {
                                        msgArray.pushMap(ResultUtils.toJSObject(msg));
                                    }
                                    map.putArray(Constant.MESSAGE_ARRAY, msgArray);
                                    getReactApplicationContext()
                                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                            .emit(SYNC_OFFLINE_EVENT, map);
                                }
                            }
                        });
                        break;
                    case voice:
                        ((VoiceContent) msg.getContent()).downloadVoiceFile(msg, new DownloadCompletionCallback() {
                            @Override
                            public void onComplete(int status, String desc, File file) {
                                if (fI == fLastMediaMsgIndex) {
                                    for (Message msg : offlineMsgList) {
                                        msgArray.pushMap(ResultUtils.toJSObject(msg));
                                    }
                                    map.putArray(Constant.MESSAGE_ARRAY, msgArray);
                                    getReactApplicationContext()
                                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                            .emit(SYNC_OFFLINE_EVENT, map);
                                }
                            }
                        });
                    default:
                    }
                }
            }
        }
    }

    /**
     * 聊天室消息事件
     * 
     * @param event {@link ChatRoomMessageEvent}
     */
    public void onEventMainThread(ChatRoomMessageEvent event) {
        List<Message> list = event.getMessages();
        Log.d(TAG, "收到聊天室消息");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RECEIVE_MSG_EVENT, ResultUtils.toJSArray(list));
    }

    public void onEvent(GroupApprovalEvent event) {
        Log.d(TAG, "GroupApprovalEvent, event: " + event);
        groupApprovalEventHashMap.put(event.getEventId() + "", event);
        GroupApprovalEvent.Type type = event.getType();
        final WritableMap map = Arguments.createMap();
        map.putString(Constant.EVENT_ID, event.getEventId() + "");
        map.putString(Constant.GROUP_ID, event.getGid() + "");
        map.putBoolean(Constant.IS_INITIATIVE_APPLY, type.equals(GroupApprovalEvent.Type.apply_join_group));
        event.getFromUserInfo(new GetUserInfoCallback() {
            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    map.putMap(Constant.SEND_APPLY_USER, ResultUtils.toJSObject(userInfo));
                }
            }
        });
        event.getApprovalUserInfoList(new GetUserInfoListCallback() {
            @Override
            public void gotResult(int status, String s, List<UserInfo> list) {
                if (status == 0) {
                    map.putArray(Constant.JOIN_GROUP_USERS, ResultUtils.toJSArray(list));
                }
            }
        });
        map.putString(Constant.REASON, event.getReason());
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RECEIVE_APPLY_JOIN_GROUP_APPROVAL_EVENT, map);
    }

    public void onEvent(GroupApprovedNotificationEvent event) {
        Log.d(TAG, "GroupApprovedNotificationEvent, event: " + event);
        final WritableMap map = Arguments.createMap();
        map.putBoolean(Constant.IS_AGREE, event.getApprovalResult());
        map.putString(Constant.APPLY_EVENT_ID, event.getApprovalEventID() + "");
        map.putString(Constant.GROUP_ID, event.getGroupID() + "");
        event.getOperator(new GetUserInfoCallback() {
            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    map.putMap(Constant.GROUP_ADMIN, ResultUtils.toJSObject(userInfo));
                }
            }
        });
        event.getApprovedUserInfoList(new GetUserInfoListCallback() {
            @Override
            public void gotResult(int status, String s, List<UserInfo> list) {
                if (status == 0) {
                    map.putArray(Constant.USERS, ResultUtils.toJSArray(list));
                }
            }
        });
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RECEIVE_GROUP_ADMIN_APPROVAL_EVENT, map);
    }

    public void onEvent(GroupApprovalRefuseEvent event) {
        Log.d(TAG, "GroupApprovalRefuseEvent, event: " + event);
        final WritableMap map = Arguments.createMap();
        map.putString(Constant.REASON, event.getReason());
        map.putString(Constant.GROUP_ID, event.getGid() + "");
        event.getFromUserInfo(new GetUserInfoCallback() {
            @Override
            public void gotResult(int status, String desc, UserInfo userInfo) {
                if (status == 0) {
                    map.putMap(Constant.GROUP_MANAGER, ResultUtils.toJSObject(userInfo));
                }
            }
        });
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(RECEIVE_GROUP_ADMIN_REJECT_EVENT, map);
    }
}
