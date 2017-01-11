package io.jchat.android;

import android.app.ProgressDialog;
import android.content.Context;
import android.net.Uri;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.List;


import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.enums.ConversationType;
import cn.jpush.im.android.api.event.LoginStateChangeEvent;
import cn.jpush.im.android.api.event.MessageEvent;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.GroupInfo;
import cn.jpush.im.android.api.model.Message;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;
import io.jchat.android.tools.ConversationToJSON;
import io.jchat.android.tools.HandleResponseCode;
import io.jchat.android.tools.MessageToJSON;

public class JMessageModule extends ReactContextBaseJavaModule {

    private static final String TAG = "JMessageModule";
    private ProgressDialog mDialog;
    private Context mContext;
    private String mPath;
    private Uri mUri;
    private Callback mCallback;
    private String mUsername;

    public JMessageModule(ReactApplicationContext reactContext) {
        super(reactContext);
        JMessageClient.registerEventReceiver(this);
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
    public void init(int mode) {
        JMessageClient.init(getReactApplicationContext());
        if (mode >=0 && mode <= 4) {
            JMessageClient.setNotificationMode(mode);
        }
        new NotificationClickEventReceiver(getReactApplicationContext());

    }

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

    @ReactMethod
    public void login(String username, String password, final Promise promise) {
        mContext = getCurrentActivity();
        Log.i(TAG, "username: " + username + " is logging in");
        JMessageClient.login(username, password, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                if (status == 0) {
                    promise.resolve(0);
                } else {
                    HandleResponseCode.onHandle(mContext, status, false);
                    promise.reject(status + "", desc);
                }
            }
        });
    }


    @ReactMethod
    public void register(final String username, final String password, final Promise promise) {
        mContext = getCurrentActivity();
        Log.i(TAG, "username: " + username + " password: " + password);
        if (TextUtils.isEmpty(username) || TextUtils.isEmpty(password)) {
            Toast.makeText(mContext, "Username or Password null", Toast.LENGTH_SHORT).show();
        } else {
            JMessageClient.register(username, password, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mDialog.dismiss();
                    if (status == 0) {
                        promise.resolve(0);
                    } else {
                        HandleResponseCode.onHandle(mContext, status, false);
                        promise.reject(status + "", desc);
                    }
                }
            });
        }
    }

    @ReactMethod
    public void logout() {
        JMessageClient.logout();
    }

    public void onEvent(LoginStateChangeEvent event) {


    }

    public void onEvent(MessageEvent event) {
        Message msg = event.getMessage();
        Log.d(TAG, "收到消息：msg = " + msg.toString());
        ConversationType convType = msg.getTargetType();
        if (convType == ConversationType.group) {
            long groupID = ((GroupInfo) msg.getTargetInfo()).getGroupID();
            Conversation conv = JMessageClient.getGroupConversation(groupID);
            ConversationToJSON convJSON = new ConversationToJSON(mContext, conv);
            String result = convJSON.getResult();
        } else {
            final UserInfo userInfo = (UserInfo) msg.getTargetInfo();
            final String targetId = userInfo.getUserName();
            Conversation conv = JMessageClient.getSingleConversation(targetId, userInfo.getAppKey());
            ConversationToJSON convJSON = new ConversationToJSON(mContext, conv);
            String result = convJSON.getResult();
        }

        List<Message> list = new ArrayList<>();
        list.add(msg);
        MessageToJSON msgJson = new MessageToJSON(mContext, list);
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("receiveMsgEvent", msgJson.getResult());
    }

    @ReactMethod
    public void addListener() {

    }


    @ReactMethod
    public void finishFillInfo(String nickname, final Callback callback) {
        mContext = getCurrentActivity();
        nickname = nickname.trim();
        if (TextUtils.isEmpty(nickname)) {
            Toast.makeText(mContext, mContext.getString(R.string.nickname_not_null_toast), Toast.LENGTH_SHORT).show();
        } else {
            Log.i(TAG, "nickname: " + nickname);
            mDialog = new ProgressDialog(mContext);
            mDialog.setMessage(mContext.getString(R.string.saving_hint));
            mDialog.show();
            UserInfo myInfo = JMessageClient.getMyInfo();
            myInfo.setNickname(nickname);
            JMessageClient.updateMyInfo(UserInfo.Field.nickname, myInfo, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mDialog.dismiss();
                    if (status == 0) {
                        SharePreferenceManager.setCachedFixProfileFlag(true);
                    } else {
                        Toast.makeText(mContext, mContext.getString(R.string.nickname_save_failed),
                                Toast.LENGTH_SHORT).show();
                    }
                    callback.invoke();
                }
            });
        }
    }

    /**
     * JS端调用的获取所有会话的方法
     * @param successCallback 回调返回一个Map对象
     */
    @ReactMethod
    public void getConvList(Callback successCallback, Callback errorCallback) {
        mContext = getCurrentActivity();
        List<Conversation> data = JMessageClient.getConversationList();
        //对会话列表进行时间排序
        if (data != null) {
            //模拟将从服务器端返回的数据解析为JSON字符串传到JS端
            //如果是纯React应用应该在JS端直接fetch服务端的数据,由于目前使用的是jmessage-sdk,所以采用这种方法
            ConversationToJSON convToJSON = new ConversationToJSON(mContext, data);
            String result = convToJSON.getResult();
            Log.i(TAG,"Result: " + result);
            successCallback.invoke(result);
        } else {
            errorCallback.invoke();
        }
    }

    /**
     * JS端调用的添加朋友方法,回调返回一个Map对象
     * @param username 要添加的用户名
     * @param promise 回调
     */
    @ReactMethod
    public void addFriend(final String username, final Promise promise) {
        mContext = getCurrentActivity();
        if (TextUtils.isEmpty(username)) {
            HandleResponseCode.onHandle(mContext, 802001, true);
        } else if (username.equals(JMessageClient.getMyInfo().getUserName())) {
            HandleResponseCode.onHandle(mContext, 1003, true);
        } else if (isExistConv(username)) {
            HandleResponseCode.onHandle(mContext, 810007, true);
        } else {
            JMessageClient.getUserInfo(username, new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    if (status == 0) {
                        Conversation conv = Conversation.createSingleConversation(username);
                        ConversationToJSON conversationToJSON = new ConversationToJSON(mContext, conv);
                        String result = conversationToJSON.getResult();
                        Log.i(TAG, "result: " + result);
                        promise.resolve(result);
                    } else {
                        HandleResponseCode.onHandle(mContext, status, false);
                        promise.reject(status + "", desc);
                    }
                }
            });
        }
    }

    public boolean isExistConv(String username) {
        Conversation conv = JMessageClient.getSingleConversation(username);
        return conv != null;
    }

    @ReactMethod
    public void createGroup(final Promise promise) {
        mContext = getCurrentActivity();
        JMessageClient.createGroup("", "", new CreateGroupCallback() {
            @Override
            public void gotResult(int status, String desc, long groupId) {
                if (status == 0) {
                    Conversation conv = Conversation.createGroupConversation(groupId);
                    ConversationToJSON convJSON = new ConversationToJSON(mContext, conv);
                    String result = convJSON.getResult();
                    Log.i(TAG, "Create Group, Result: " + result);
                    promise.resolve(result);
                } else {
                    HandleResponseCode.onHandle(mContext, status, false);
                    promise.reject(status + "", desc);
                }
            }
        });
    }

    //groupId从native传到JS,再从JS传回来,变成了int64,此处可能存在类型转换错误
    @ReactMethod
    public void deleteConversation(String username, int groupId, String appKey, Promise promise) {
        try {
            if (groupId != 0) {
                JMessageClient.deleteGroupConversation(groupId);
                promise.resolve(0);
            } else {
                JMessageClient.deleteSingleConversation(username, appKey);
                promise.resolve(0);
            }
        } catch (Exception e) {
            promise.reject(e.getMessage());
        }

    }
}
