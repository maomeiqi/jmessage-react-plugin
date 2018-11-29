package com.sample.application;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.rnfs.RNFSPackage;

import cn.jiguang.imui.messagelist.BuildConfig;
import io.jchat.android.JMessageReactPackage;

import cn.jiguang.imui.messagelist.ReactIMUIPackage;
import cn.jpush.im.android.api.JMessageClient;
import io.jchat.android.JMessageReactPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.rnfs.RNFSPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private static final boolean SHUTDOWN_TOAST = false;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new JMessageReactPackage(SHUTDOWN_TOAST),
                    new ReactIMUIPackage(),
                    new RNFSPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        Log.i("MainApplication", "Init JMessageClient");
        JMessageClient.setDebugMode(true);
        // JMessage SDK 2.5.0 后必须在 MainApplication 中初始化
        JMessageClient.init(this, true);
    }
}
