# jmessage-react-plugin 

极光官方开发的[极光 IM](https://docs.jiguang.cn/jmessage/guideline/jmessage_guide/) react-native 插件，同时支持 文字、图片、语言、文件和自定义消息。同时支持 iOS 和 Android 平台。

## 安装

```
npm install jmessage-react-plugin --save
npm install jcore-react-native --save（目前 jmessage-react-plugin 2.0.0-beta 版本需要指定安装 jcore-react-native 1.1.8-beta2 版本）
react-native link
```

## 配置

#### Android


安装完毕后，在 MainApplication 中加上 JMessagePackage 即可。
```
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new JMessageReactPackage(),
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

