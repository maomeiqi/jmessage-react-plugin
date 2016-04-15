package io.jchat.android;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.util.Collections;
import java.util.List;


import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.CreateGroupCallback;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.UserInfo;
import cn.jpush.im.api.BasicCallback;
import io.jchat.android.tools.BitmapLoader;
import io.jchat.android.tools.ConversationToJSON;
import io.jchat.android.tools.FileHelper;
import io.jchat.android.tools.HandleResponseCode;
import io.jchat.android.tools.SortConvList;

public class JMessageHelper extends ReactContextBaseJavaModule implements ActivityEventListener {

    private static final String TAG = "JMessageHelper";
    private ProgressDialog mDialog;
    private Context mContext;
    private String mPath;
    private Uri mUri;
    private Callback mCallback;
    private String mUsername;

    public JMessageHelper(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
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
        } else if (TextUtils.isEmpty(JMessageClient.getMyInfo().getNickname()) && flag) {
            result = "fillInfo";
        } else {
            result = "mainActivity";
        }
        map.putString("result", result);
        callback.invoke(map);
    }

    @ReactMethod
    public void loginWithoutDialog(String username, String password, final Callback successCallback,
                                   final Callback errorCallback) {
        mContext = getCurrentActivity();
        Log.i(TAG, "username: " + username + " is logging in");
        JMessageClient.login(username, password, new BasicCallback() {
            @Override
            public void gotResult(int status, String desc) {
                if (status == 0) {
                    successCallback.invoke();
                } else {
                    HandleResponseCode.onHandle(mContext, status, false);
                    errorCallback.invoke();
                }
            }
        });
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
    public void register(final String username, final String password, final Callback callback) {
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
                        JMessageClient.login(username, password, new BasicCallback() {
                            @Override
                            public void gotResult(int status, String desc) {
                                if (status == 0) {
                                    callback.invoke();
                                } else {
                                    HandleResponseCode.onHandle(mContext, status, false);
                                }
                            }
                        });
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

    @ReactMethod
    public void takePhoto(String username, Callback callback) {
        Activity activity = getCurrentActivity();
        mUsername = username;
        mCallback = callback;
        if (activity != null) {
            try {
                if (FileHelper.isSdCardExist()) {
                    Log.i(TAG, "Try to invoke camera ");
                    mPath = FileHelper.createAvatarPath(JMessageClient.getMyInfo().getUserName());
                    File file = new File(mPath);
                    Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(file));
                    activity.startActivityForResult(intent, JChatApplication.REQUEST_CODE_TAKE_PHOTO);
                } else {
                    Toast.makeText(activity, activity.getString(R.string.sdcard_not_exist_toast),
                            Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @ReactMethod
    public void selectImageFromLocal() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            try {
                Intent intent;
                if (Build.VERSION.SDK_INT < 19) {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.setType("image/*");
                }else {
                    intent = new Intent(Intent.ACTION_PICK,
                            android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                }
                activity.startActivityForResult(intent, JChatApplication.REQUEST_CODE_SELECT_PICTURE);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }

    /**
     * JS端调用的检查网络是否连接的方法
     * @param callback 回调返回是否显示HeaderView
     */
    @ReactMethod
    public void checkNetwork(Callback callback) {
        mContext = getCurrentActivity();
        if (mContext != null) {
            ConnectivityManager manager = (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo activeInfo = manager.getActiveNetworkInfo();
            if (null == activeInfo) {
                //显示Header
                callback.invoke(true);
            } else {
                callback.invoke(false);
            }
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
            if (data.size() > 1) {
                SortConvList sortList = new SortConvList();
                Collections.sort(data, sortList);
            }
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
     * @param callback 回调
     */
    @ReactMethod
    public void addFriend(final String username, final Callback callback) {
        mContext = getCurrentActivity();
        if (TextUtils.isEmpty(username)) {
            HandleResponseCode.onHandle(mContext, 802001, true);
        } else if (username.equals(JMessageClient.getMyInfo().getUserName())) {
            HandleResponseCode.onHandle(mContext, 1003, true);
        } else if (isExistConv(username)) {
            HandleResponseCode.onHandle(mContext, 810007, true);
        } else {
            final ProgressDialog dialog = new ProgressDialog(mContext);
            dialog.setMessage(mContext.getString(R.string.adding_hint));
            dialog.show();
            JMessageClient.getUserInfo(username, new GetUserInfoCallback() {
                @Override
                public void gotResult(int status, String desc, UserInfo userInfo) {
                    dialog.dismiss();
                    if (status == 0) {
                        Conversation conv = Conversation.createSingleConversation(username);
                        ConversationToJSON conversationToJSON = new ConversationToJSON(mContext, conv);
                        String result = conversationToJSON.getResult();
                        Log.i(TAG, "result: " + result);
                        callback.invoke(result);
                    } else {
                        HandleResponseCode.onHandle(mContext, status, false);
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
    public void createGroup(final Callback callback) {
        mContext = getCurrentActivity();
        final ProgressDialog dialog = new ProgressDialog(mContext);
        dialog.setMessage(mContext.getString(R.string.creating_hint));
        dialog.show();
        JMessageClient.createGroup("", "", new CreateGroupCallback() {
            @Override
            public void gotResult(int status, String desc, long groupId) {
                dialog.dismiss();
                if (status == 0) {
                    Conversation conv = Conversation.createGroupConversation(groupId);
                    ConversationToJSON convJSON = new ConversationToJSON(mContext, conv);
                    String result = convJSON.getResult();
                    Log.i(TAG, "Create Group, Result: " + result);
                    callback.invoke(result);
                } else {
                    HandleResponseCode.onHandle(mContext, status, false);
                }
            }
        });
    }

    //groupId从native传到JS,再从JS传回来,变成了int64,此处可能存在类型转换错误
    @ReactMethod
    public void deleteConversation(String username, int groupId, String appKey, Callback callback) {
        if (groupId != 0) {
            JMessageClient.deleteGroupConversation(groupId);
            callback.invoke();
        } else {
            JMessageClient.deleteSingleConversation(username, appKey);
            callback.invoke();
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        final Activity activity = getCurrentActivity();
        if (resultCode == Activity.RESULT_CANCELED) {
            return;
        }
        if (requestCode == JChatApplication.REQUEST_CODE_TAKE_PHOTO) {
            if (mPath != null && activity != null) {
//                mUri = Uri.fromFile(new File(mPath));
                mDialog = new ProgressDialog(activity);
                mDialog.setMessage(activity.getString(R.string.saving_hint));
                mDialog.show();
                Bitmap bitmap = BitmapLoader.getBitmapFromFile(mPath, 1280, 720);
                final String path = BitmapLoader.saveBitmapToLocal(bitmap, activity, mUsername);
                JMessageClient.updateUserAvatar(new File(path), new BasicCallback() {
                    @Override
                    public void gotResult(int status, String desc) {
                        mDialog.dismiss();
                        if (status == 0) {
                            mCallback.invoke(path);
                        } else {
                            HandleResponseCode.onHandle(activity, status, false);
                        }
                    }
                });

            }
        } else if (requestCode == JChatApplication.REQUEST_CODE_SELECT_PICTURE) {
            if (data != null) {
                Uri selectedImg = data.getData();
                if (selectedImg != null) {
                    String[] filePathColumn = { MediaStore.Images.Media.DATA };
                    if (activity != null) {
                        Cursor cursor = getCurrentActivity().getContentResolver()
                                .query(selectedImg, filePathColumn, null, null, null);
                        try {
                            if (null == cursor) {
                                String path = selectedImg.getPath();
                                File file = new File(path);
                                if (file.isFile()) {
//                                copyAndCrop(file);
                                    mCallback.invoke(path);
                                    return;
                                } else {
                                    Toast.makeText(activity, activity.getString(R.string.picture_not_found),
                                            Toast.LENGTH_SHORT).show();
                                    return;
                                }
                            } else if (!cursor.moveToFirst()) {
                                Toast.makeText(activity, activity.getString(R.string.picture_not_found),
                                        Toast.LENGTH_SHORT).show();
                                return;
                            }
                            int columnIndex = cursor.getColumnIndex(filePathColumn[0]);
                            String path = cursor.getString(columnIndex);
                            if (path != null) {
                                File file = new File(path);
                                if (!file.isFile()) {
                                    Toast.makeText(activity, activity.getString(R.string.picture_not_found),
                                            Toast.LENGTH_SHORT).show();
                                    cursor.close();
                                } else {
                                    //如果是选择本地图片进行头像设置，复制到临时文件，并进行裁剪
//                                    copyAndCrop(file);
                                    cursor.close();
                                    mCallback.invoke(path);
                                }
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }

            }
        }
    }
}
