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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;


import cn.jpush.im.android.api.ContactManager;
import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.DownloadCompletionCallback;
import cn.jpush.im.android.api.callback.GetAvatarBitmapCallback;
import cn.jpush.im.android.api.callback.GetBlacklistCallback;
import cn.jpush.im.android.api.callback.GetGroupIDListCallback;
import cn.jpush.im.android.api.callback.GetGroupInfoCallback;
import cn.jpush.im.android.api.callback.GetGroupMembersCallback;
import cn.jpush.im.android.api.callback.GetNoDisurbListCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.callback.GetUserInfoListCallback;
import cn.jpush.im.android.api.callback.IntegerCallback;
import cn.jpush.im.android.api.callback.ProgressUpdateCallback;
import cn.jpush.im.android.api.content.CustomContent;
import cn.jpush.im.android.api.content.FileContent;
import cn.jpush.im.android.api.content.ImageContent;
import cn.jpush.im.android.api.content.LocationContent;
import cn.jpush.im.android.api.content.MessageContent;
import cn.jpush.im.android.api.content.TextContent;
import cn.jpush.im.android.api.content.VoiceContent;
import cn.jpush.im.android.api.enums.ContentType;
import cn.jpush.im.android.api.event.ContactNotifyEvent;
import cn.jpush.im.android.api.event.ConversationRefreshEvent;
import cn.jpush.im.android.api.event.LoginStateChangeEvent;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.event.MessageRetractEvent;
import cn.jpush.im.android.api.event.NotificationClickEvent;
import cn.jpush.im.android.api.event.OfflineMessageEvent;
import cn.jpush.im.android.api.model.Conversation;
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
    private static final int ERR_CODE_PARAMETER = 1;
    private static final int ERR_CODE_CONVERSATION = 2;
    private static final int ERR_CODE_MESSAGE = 3;
    private static final int ERR_CODE_FILE = 4;

    private static final String ERR_MSG_PARAMETER = "Parameters error";
    private static final String ERR_MSG_CONVERSATION = "Can't get the conversation";
    private static final String ERR_MSG_MESSAGE = "No such message";

    private Context mContext;
    private JMessageUtils mJMessageUtils;

    public JMessageModule(ReactApplicationContext reactContext, boolean shutdownToast) {
        super(reactContext);
        mJMessageUtils = new JMessageUtils(reactContext, shutdownToast);
        mContext = reactContext;
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
    public void init(ReadableMap map) {
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
        //第一次登录需要设置昵称
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
    public void register(ReadableMap map, final Callback success, final Callback fail) {
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
    public void updateMyInfo(ReadableMap map, final Callback success, final Callback fail) {
        UserInfo myInfo = JMessageClient.getMyInfo();
        if (map.hasKey(Constant.NICKNAME)) {
            myInfo.setNickname(map.getString(Constant.NICKNAME));
        }
        if (map.hasKey(Constant.BIRTHDAY)) {
            myInfo.setBirthday((long) map.getDouble(Constant.BIRTHDAY));
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
            if (type.equals(Constant.TEXT)) {
                content = new TextContent(map.getString(Constant.TEXT));
            } else if (type.equals(Constant.IMAGE)) {
                String path = map.getString(Constant.PATH);
                content = new ImageContent(new File(path));
            } else if (type.equals(Constant.VOICE)) {
                String path = map.getString(Constant.PATH);
                File file = new File(map.getString(path));
                MediaPlayer mediaPlayer = MediaPlayer.create(mContext, Uri.parse(path));
                int duration = mediaPlayer.getDuration() / 1000;    // Millisecond to second.
                content = new VoiceContent(file, duration);
                mediaPlayer.release();
            } else if (type.equals(Constant.LOCATION)) {
                double latitude = map.getDouble(Constant.LATITUDE);
                double longitude = map.getDouble(Constant.LONGITUDE);
                int scale = map.getInt(Constant.SCALE);
                String address = map.getString(Constant.ADDRESS);
                content = new LocationContent(latitude, longitude, scale, address);
            } else {
                content = new CustomContent();
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
            final Message message = conversation.getMessage(map.getInt(Constant.ID));
            if (map.hasKey(Constant.SENDING_OPTIONS)) {
                MessageSendingOptions options = new MessageSendingOptions();
                ReadableMap optionMap = map.getMap(Constant.SENDING_OPTIONS);
                options.setShowNotification(optionMap.getBoolean("isShowNotification"));
                options.setRetainOffline(optionMap.getBoolean("isRetainOffline"));

                if (optionMap.hasKey("isCustomNotificationEnabled")) {
                    options.setCustomNotificationEnabled(
                            optionMap.getBoolean("isCustomNotificationEnabled"));
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
            if (message.getContentType() == ContentType.image) {
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
            ImageContent content = new ImageContent(new File(path));
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
            int duration = mediaPlayer.getDuration() / 1000;    // Millisecond to second.
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
            String fileName = map.getString(Constant.FILE_NAME);
            String path = map.getString(Constant.PATH);
            FileContent content = new FileContent(new File(path), fileName);
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
            JMessageClient.createGroup(name, desc, new CreateGroupCallback() {
                @Override
                public void gotResult(int status, String desc, long groupId) {
                    mJMessageUtils.handleCallbackWithValue(status, desc, success, fail,String.valueOf(groupId));
                }
            });
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
                    mJMessageUtils.handleCallback(status, desc, success,fail);
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
                                String fileName = username + appKey;
                                String filePath = mJMessageUtils.getAvatarPath(packageName);
                                File avatarFile = new File(filePath + fileName + ".png");
                                if (!avatarFile.exists()) {
                                    mJMessageUtils.storeImage(bitmap, fileName, packageName);
                                }
                                WritableMap result = Arguments.createMap();
                                result.putString(Constant.FILE_PATH, filePath);
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
            if (msg.getContentType() != ContentType.image) {
                mJMessageUtils.handleError(fail, ERR_CODE_MESSAGE, "Wrong message type");
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
                mJMessageUtils.handleCallbackWithObject(0, "", success, fail,
                        ResultUtils.toJSObject(conversation));
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
            } else {
                long groupId = Long.parseLong(map.getString(Constant.GROUP_ID));
                JMessageClient.deleteGroupConversation(groupId);
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
            } else {
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
                mJMessageUtils.handleCallbackWithObject(0, "", success, fail,
                        ResultUtils.toJSObject(conversation));
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
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP
                    | Intent.FLAG_ACTIVITY_CLEAR_TOP);
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
                for (Message msg: offlineMsgList) {
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
                                        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
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
                                        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
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
}
