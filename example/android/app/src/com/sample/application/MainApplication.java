package com.sample.application;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.lwansbrough.RCTCamera.RCTCameraPackage;

import java.util.Arrays;
import java.util.List;

import io.jchat.android.BuildConfig;
import io.jchat.android.JMessageReactPackage;


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
                    new RCTCameraPackage(),
                    new JMessageReactPackage()
            );
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }


}
