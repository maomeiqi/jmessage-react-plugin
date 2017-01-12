package com.sample.application;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;

import java.lang.Override;

import cn.jiguang.api.JCoreInterface;


public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    protected String getMainComponentName() {
        return "JChatApp";
    }

    @Override
    protected void onPause() {
        super.onPause();
        JCoreInterface.onPause(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        JCoreInterface.onResume(this);
    }

}
