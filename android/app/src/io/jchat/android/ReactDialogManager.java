package io.jchat.android;

import android.app.Dialog;
import android.support.annotation.Nullable;

import com.facebook.react.uimanager.ReactProp;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class ReactDialogManager extends SimpleViewManager<ReactDialog> {
    @Override
    public String getName() {
        return "RCTDialog";
    }

    @Override
    protected ReactDialog createViewInstance(ThemedReactContext reactContext) {
        return new ReactDialog(reactContext);
    }

    @ReactProp(name = "title")
    public void setTitle(ReactDialog dialog, @Nullable String title) {
        dialog.setTitle(title);
    }
}
