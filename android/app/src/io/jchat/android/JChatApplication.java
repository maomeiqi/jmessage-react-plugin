package io.jchat.android;

import android.app.Application;
import android.content.Context;

import cn.jpush.im.android.api.JMessageClient;


public class JChatApplication extends Application {

    private static Context mContext;
    public static final String PICTURE_DIR = "sdcard/JChatDemo/pictures/";

    @Override
    public void onCreate() {
        super.onCreate();
        mContext = getApplicationContext();
        JMessageClient.init(mContext);
        JMessageClient.setNotificationMode(JMessageClient.NOTI_MODE_DEFAULT);
        SharePreferenceManager.init(mContext, "JChatConfigs");
    }

    public static Context getContext() {
        return mContext;
    }
}
