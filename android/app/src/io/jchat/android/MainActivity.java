package io.jchat.android;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.lang.Override;

import cn.jpush.android.api.JPushInterface;
import io.jchat.android.ReactInstanceHelper;

public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {

    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;
    public static boolean isForeground = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceHelper.getInstance();
        mReactRootView.startReactApplication(mReactInstanceManager, "JChatApp", null);

        setContentView(mReactRootView);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        isForeground = false;
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onPause();
        }
        JPushInterface.onPause(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        isForeground = true;
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onResume(this, this);
        }
        JPushInterface.onResume(this);
    }

    @Override
    public void onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onBackPressed();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_MENU && mReactInstanceManager != null) {
            mReactInstanceManager.showDevOptionsDialog();
            return true;
        }
        return super.onKeyUp(keyCode, event);
    }


}
