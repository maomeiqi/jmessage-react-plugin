package io.jchat.android;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;

public class JMessageHelper extends ReactContextBaseJavaModule {

    private static final String TAG = "JMessageHelper";
    private ProgressDialog mDialog;
    private Context mContext;

    public JMessageHelper(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "JMessageHelper";
    }

    @Override
    public boolean canOverrideExistingModule() {
        return true;
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
        } else if (TextUtils.isEmpty(JMessageClient.getMyInfo().getNickname()) && !flag) {
            result = "fillInfo";
        } else {
            result = "";
        }
        map.putString("result", result);
        callback.invoke(map);
    }

    @ReactMethod
    public void login(boolean isCached, String username, String password, final Callback successCallback) {
        mContext = getCurrentActivity();
        mDialog = new ProgressDialog(mContext);
        mDialog.setMessage(mContext.getString(R.string.login_hint));
        //重新登录
        if (isCached) {
            username = SharePreferenceManager.getCachedUsername();
            if (TextUtils.isEmpty(username)) {
                Toast.makeText(mContext, "Username HAD NOT cached!", Toast.LENGTH_SHORT).show();
                return;
            }
            mDialog.show();
            JMessageClient.login(username, password, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mDialog.dismiss();
                    if (status == 0) {
                        successCallback.invoke();
                    } else {
                        HandleResponseCode.onHandle(mContext, status, false);
                    }
                }
            });
        } else {
            mDialog.show();
            JMessageClient.login(username, password, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mDialog.dismiss();
                    if (status == 0) {
                        successCallback.invoke();
                    } else {
                        HandleResponseCode.onHandle(mContext, status, false);
                    }
                }
            });
        }
    }

    @ReactMethod
    public void register(String username, String password, final Callback callback) {
        username = username.trim();
        password = password.trim();
        mContext = getCurrentActivity();
        Log.i(TAG, "username: " + username + " password: " + password);
        if (TextUtils.isEmpty(username) || TextUtils.isEmpty(password)) {
            Toast.makeText(mContext, "Username or Password null", Toast.LENGTH_SHORT).show();
        } else {
            mDialog = new ProgressDialog(mContext);
            mDialog.setMessage(mContext.getString(R.string.registering_hint));
            mDialog.show();
            JMessageClient.register(username, password, new BasicCallback() {
                @Override
                public void gotResult(int status, String desc) {
                    mDialog.dismiss();
                    if (status == 0) {
                        callback.invoke();
                        Toast.makeText(mContext, "Register succeed", Toast.LENGTH_SHORT).show();
                    } else {
                        HandleResponseCode.onHandle(mContext, status, false);
                    }
                }
            });
        }
    }

    @ReactMethod
    public void logout(Callback callback) {
        UserInfo info = JMessageClient.getMyInfo();
        final Intent intent = new Intent();
        if (null != info) {
            intent.putExtra("userName", info.getUserName());
            File file = info.getAvatarFile();
            if (file != null && file.isFile()) {
                intent.putExtra("avatarFilePath", file.getAbsolutePath());
            } else {
                String path = FileHelper.getUserAvatarPath(info.getUserName());
                file = new File(path);
                if (file.exists()) {
                    intent.putExtra("avatarFilePath", file.getAbsolutePath());
                }
            }
            SharePreferenceManager.setCachedUsername(info.getUserName());
            SharePreferenceManager.setCachedAvatarPath(file.getAbsolutePath());
            JMessageClient.logout();
            callback.invoke(SharePreferenceManager.getCachedUsername());
        }
    }

    @ReactMethod
    public void finishFillInfo(String nickname, final Callback callback) {
        mContext = getCurrentActivity();
        nickname = nickname.trim();
        if (TextUtils.isEmpty(nickname)) {
            Toast.makeText(mContext, mContext.getString(R.string.nickname_not_null_toast), Toast.LENGTH_SHORT).show();
        } else {
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

}
