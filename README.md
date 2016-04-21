# jmessage-react-plugin

##Android

####这是一个使用JMessage-sdk的混合的React Native应用，在本项目中使用了[Redux架构](http://camsong.github.io/redux-in-chinese/)来管理状态。

####Android用法
- 下载并解压这个项目的zip
- 在初始化好的React项目中将app文件夹替换为你刚刚解压的app文件夹（jmessage-react-plugin-master/android/app）（如果你还没有初始化，[参考这个](https://facebook.github.io/react-native/docs/getting-started.html#content)）
- 修改android文件夹下的build.gradle将dependencies下的classpath修改为你当前Android Studio所用的版本
- 修改app文件夹下的build.gradle，将compile "com.facebook.react:react-native:0.23.0"修改为你当前的版本
- 在AndroidManifest中更改PackageName和build.gradle中的applicationId为你自己的包名
- 在AndroidManifest中将appKey替换为你在极光推送控制台注册的应用的appKey，如果没有，可以[前往注册](https://www.jpush.cn/)
- 运行app
 
关于jmessage-sdk的相关接口说明可以参考：
#####[极光IM Android SDK概述](http://docs.jpush.io/client/im_sdk_android/)

#####[IM Android SDK Java docs](http://docs.jpush.io/client/im_android_api_docs/)

####jmessage-react-plugin Android的项目结构说明
#####JS部分
除了入口index.android.js之外，都放在react-native-android文件夹下
- actions 充当调用jmessage-sdk动作的发起者，action可以再抽象出一个中间件，但本项目中没有这样做
- containers 所有Component的集合，负责界面的更新与发起actions
- reducers 根据一个action返回一个新的state，负责state的更新
- store 绑定actions和reducers
 
#####Native部分
- entity 根据需求抽象出的一些实体类，主要是为了使用Gson转换为json字符串传到JS（如果是纯React Native应用，则不需要如此，直接请求服务端即可）
- tools 主要是一些工具类
- 其他 包括Native入口类以及NativeModule等

####接口调用
#####在JS中调用jmessage-sdk的接口
> actions/conversationActions.js

```
export function loadConversations() {
	return dispatch => {
		type: types.INITIAL_CONVERSATION_LIST,
		JMessageHelper.getConvList((result) => {
			dispatch({
				type: types.LOAD_CONVERSATIONS,
				convList: JSON.parse(result),
			});
		}, () => {
			dispatch({
				type: types.LOAD_ERROR,
				convList: []
			})
		});
	}
}
```

这个action实际上通过JMessageHelper这个NativeModule调用了getConvList()这个方法：
> JMessageHelper.java

```
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
```

在Native里就可以直接调用jmessage-sdk的接口了，然后将得到的数据通过CallBack传递到JS。其他的接口调用也基本上类似。

##关于升级React Native
**进入当前项目的目录**
- 在命令行中使用：

> react-native --version

就可以查看当前使用的版本

- 在命令行中输入：

> npm info react-native

就可以查看React Native的历史和最新版本

- React Native可以直接更新到某个版本：

> npm install --save react-native@0.23.0

就可以更新到0.23.0版本

如果升级后出现类似于
```
react-native@0.23.0 requires a peer of react@^0.14.5 but none was installed.
```

执行:
> npm install --save react

或者：
> npm install --save react@0.14.5

即可。

如果更新后执行react-native run-android不能正确运行，而是出现类似：
```
 Could not find com.facebook.react:react-native:0.23.0.
```

错误，或者在Android Studio中直接运行app时报错：
```
Android Studio failed to resolve com.facebook.react:react-native:0.23.0
```

那么可以按照下列命令修复，首先在命令行中执行：
> npm i

执行完毕且不报错后，执行下面的命令，**注意，在执行命令之后，某些文件可能会产生冲突，请确保你的本地文件记录可以恢复**（在Android Studio中可以查看历史记录来恢复文件）
> react-native upgrade

执行上面的命令可能会提示你是否覆盖文件。在解决冲突之后重新运行App即可。
