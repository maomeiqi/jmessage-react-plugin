package io.jchat.android;

import android.app.Application;

import com.aakashns.reactnativedialogs.ReactNativeDialogsPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;

import java.util.Arrays;
import java.util.List;

import cn.jpush.im.android.api.JMessageClient;


public class MainApplication extends Application implements ReactApplication {

    public static final String PICTURE_DIR = "sdcard/JChatDemo/pictures/";
    public static final int REQUEST_CODE_TAKE_PHOTO = 4;
    public static final int REQUEST_CODE_SELECT_PICTURE = 6;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }


        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new CustomReactPackage(),
                    new RCTCameraPackage(),
                    new OrientationPackage()
            );
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        JMessageClient.init(getApplicationContext());
        JMessageClient.setNotificationMode(JMessageClient.NOTI_MODE_DEFAULT);
        SharePreferenceManager.init(getApplicationContext(), "JChatConfigs");
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }


}
