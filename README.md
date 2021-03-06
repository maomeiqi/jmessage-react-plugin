# jmessage-react-plugin 

极光官方开发的[极光 IM](https://docs.jiguang.cn/jmessage/guideline/jmessage_guide/) react-native 插件，同时支持 文字、图片、语言、文件和自定义消息。同时支持 iOS 和 Android 平台。

## 安装

```
npm install jmessage-react-plugin --save
npm install jcore-react-native --save（目前 jmessage-react-plugin 2.1.1 版本需要指定安装 jcore-react-native 1.2.1 以上版本）
react-native link
```

##### （如果是原生应用集成 react-native）使用 CocoaPods 安装

**注意： 如果已经通过 react-native link 链接了插件，则不需要执行下面的步骤。**


在 Podfile 中添加如下代码:

```
pod 'JMessageRN', :path => '../node_modules/jmessage-react-plugin'
```

终端执行如下指令:

```
pod install
```

## 配置

#### Android

- 配置 AndroidManifest，加入 `meta-data` 部分
```
...
<meta-data android:name="JPUSH_CHANNEL" android:value="${APP_CHANNEL}" />
<meta-data android:name="JPUSH_APPKEY" android:value="${JPUSH_APPKEY}" />
...
```
- 配置 build.gradle，将下列配置部分替换成自己的。
```
defaultConfig {
        applicationId "你的 application id"
        minSdkVersion 16
        targetSdkVersion 22
        versionCode 1
        versionName "1.0"
        ndk {
            abiFilters "armeabi-v7a", "x86"
        }
        manifestPlaceholders = [
                JPUSH_APPKEY: "你的 appKey",	//在此替换你的APPKey
                APP_CHANNEL: "developer-default"		//应用渠道号
        ]
    }
```

在 MainApplication 中加上 JMessagePackage 即可，JMessagePackage 有一个参数，设置是否弹出 toast。
```
// 如果设置为 true，则不弹出 toast。
private boolean shutdownToast = false;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new JMessageReactPackage(shutdownToast),
    );
}
```

#### iOS

- 打开工程，进入 Build Settings -> Framework search paths 添加 framework 搜索路径

  ```
  $(SRCROOT)/../node_modules/jmessage-react-plugin/ios/RCTJMessageModule
  ```

- 打开工程，进入 Build Settings -> Other Link Flag 添加一行编译选项

  ```
  -framework "JMessage"
  ```


## API

[API doc](./document/API.md)

## 更多

- QQ 群：553406342
- [极光官网文档](http://docs.jiguang.cn/guideline/jmessage_guide/)
- 插件问题可以直接提 [issue](https://github.com/jpush/jmessage-react-plugin/issues)
- 有问题可访问[极光社区](http://community.jiguang.cn/)搜索和提问。

