package io.jchat.android;

import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import cn.jpush.im.android.api.JMessageClient;
import cn.jpush.im.android.api.callback.GetUserInfoCallback;
import cn.jpush.im.android.api.model.Conversation;
import cn.jpush.im.android.api.model.UserInfo;

public class ReactDialog extends View {

    private Dialog mDialog;
    private Context mContext;
    private ProgressDialog mLoadingDialog;
    private LinearLayout layout;
    private TextView mTitle;
    private EditText mInputEt;
    private Button mCancelBtn;
    private Button mCommitBtn;

    public ReactDialog(Context context) {
        super(context);
        init(context);
    }

    public ReactDialog(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public ReactDialog(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init(context);
    }

    private void init(Context context) {
        mContext = context;
        if (layout != null && mDialog != null) {
            mDialog.show();
            return;
        }
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        layout = (LinearLayout) inflater.inflate(R.layout.dialog_add_friend_to_conv_list, null);
        mTitle = (TextView) layout.findViewById(R.id.dialog_name);
        mInputEt = (EditText) layout.findViewById(R.id.user_name_et);
        mCancelBtn = (Button) layout.findViewById(R.id.cancel_btn);
        mCommitBtn = (Button) layout.findViewById(R.id.commit_btn);
        mCancelBtn.setOnClickListener(listener);
        mCommitBtn.setOnClickListener(listener);
        mDialog = new Dialog(context, R.style.default_dialog_style);
        mDialog.setContentView(layout);
        mDialog.show();
    }

    OnClickListener listener = new OnClickListener() {
        @Override
        public void onClick(View v) {
            switch (v.getId()) {
                case R.id.cancel_btn:
                    mDialog.dismiss();
                    break;
                case R.id.commit_btn:
                    String username = mInputEt.getText().toString().trim();
                    if (TextUtils.isEmpty(username)) {
                        Toast.makeText(mContext,
                                mContext.getString(R.string.username_not_null_toast),
                                Toast.LENGTH_SHORT).show();
                        break;
                    } else if (username.equals(JMessageClient.getMyInfo().getUserName())
                            || username.equals(JMessageClient.getMyInfo().getNickname())) {
                        Toast.makeText(mContext,
                                mContext.getString(R.string.user_add_self_toast),
                                Toast.LENGTH_SHORT).show();
                        return;
                    } else if (isExistConv(username)) {
                        Toast.makeText(mContext,
                                mContext.getString(R.string.user_already_exist_toast),
                                Toast.LENGTH_SHORT).show();
                        mInputEt.setText("");
                        break;
                    } else {
                        mLoadingDialog = new ProgressDialog(mContext);
                        mLoadingDialog.setMessage(mContext.getString(R.string.adding_hint));
                        mLoadingDialog.show();
                        dismissSoftInput();
                        getUserInfo(username);
                    }
                    break;
            }
        }
    };

    private void getUserInfo(final String targetId){
        JMessageClient.getUserInfo(targetId, new GetUserInfoCallback() {
            @Override
            public void gotResult(final int status, String desc, final UserInfo userInfo) {
                mLoadingDialog.dismiss();
                if (status == 0) {
                    Conversation conv = Conversation.createSingleConversation(targetId);

                    mDialog.cancel();
                } else {
                    HandleResponseCode.onHandle(mContext, status, true);
                }
            }
        });
    }

    public void dismissSoftInput() {
        InputMethodManager imm = ((InputMethodManager) mContext
                .getSystemService(Activity.INPUT_METHOD_SERVICE));
        if (((Activity) mContext).getWindow().getAttributes().softInputMode
                != WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN) {
            if (((Activity) mContext).getCurrentFocus() != null)
                imm.hideSoftInputFromWindow(((Activity) mContext).getCurrentFocus().getWindowToken(),
                        InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }

    private boolean isExistConv(String targetId) {
        Conversation conv = JMessageClient.getSingleConversation(targetId);
        return conv != null;
    }


    public void setTitle(String title) {

    }

}
