package io.jchat.android;

import android.app.Activity;
import android.app.Dialog;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.view.WindowManager;
import android.widget.PopupMenu;
import android.widget.PopupWindow;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

/**
 * Created by caiyaoguan on 17/1/10.
 */

public class DialogHelper extends ReactContextBaseJavaModule {


    public DialogHelper(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "DialogHelper";
    }

    @ReactMethod
    public void showDropDownMenu(ReadableMap options, Callback callback) {
        Activity activity = getCurrentActivity();
        PopupWindow window = new PopupWindow(activity.getLayoutInflater().inflate(R.layout.drop_down_menu, null),
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT, true);
        window.setTouchable(true);
        window.setOutsideTouchable(true);
        window.setBackgroundDrawable(new BitmapDrawable(activity.getResources(),
                (Bitmap) null));
        if (window.isShowing()) {
            window.dismiss();
        } else
            window.showAsDropDown(activity.findViewById(R.id.create_group_btn), -10, -5);
    }

    }
}
