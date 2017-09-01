//
//  RCTJMessageModule.m
//  RCTJMessageModule
//
//  Created by oshumini on 2017/8/10.
//  Copyright © 2017年 HXHG. All rights reserved.
//

#import "RCTJMessageModule.h"

#if __has_include(<React/RCTBridge.h>)
#import <React/RCTEventDispatcher.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge.h>
#elif __has_include("RCTBridge.h")
#import "RCTEventDispatcher.h"
#import "RCTRootView.h"
#import "RCTBridge.h"
#elif __has_include("React/RCTBridge.h")
#import "React/RCTEventDispatcher.h"
#import "React/RCTRootView.h"
#import "React/RCTBridge.h"
#endif

#import "JMessageHelper.h"
#import <JMessage/JMessage.h>
#import <AVFoundation/AVFoundation.h>
@interface RCTJMessageModule ()<JMessageDelegate, JMSGEventDelegate, UIApplicationDelegate>

@property(strong,nonatomic)NSMutableDictionary *SendMsgCallbackDic;//{@"msgid": @"", @"RCTJMessageModule": @[successCallback, failCallback]}
@end

@implementation RCTJMessageModule
RCT_EXPORT_MODULE();
@synthesize bridge = _bridge;

+ (id)allocWithZone:(NSZone *)zone {
  static RCTJMessageModule *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (id)init {
  self = [super init];
  [self initNotifications];
  self.SendMsgCallbackDic = @{}.mutableCopy;
  return self;
}

- (void)setBridge:(RCTBridge *)bridge {
  _bridge = bridge;
  JMessageHelper.shareInstance.launchOptions = _bridge.launchOptions;
}

-(void)initNotifications {
  [[NSNotificationCenter defaultCenter] removeObserver:self]; 
  
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(didReceiveJMessageMessage:)
                        name:kJJMessageReceiveMessage
                      object:nil];
  
//  [defaultCenter addObserver:self
//                    selector:@selector(conversationChanged:)
//                        name:kJJMessageConversationChanged
//                      object:nil];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(didSendMessage:)
                        name:kJJMessageSendMessageRespone
                      object:nil];
  
//  [defaultCenter addObserver:self
//                    selector:@selector(unreadChanged:)
//                        name:kJJMessageUnreadChanged
//                      object:nil];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(loginStateChanged:)
                        name:kJJMessageLoginStateChanged
                      object:nil];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(onContactNotify:)
                        name:kJJMessageContactNotify
                      object:nil];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(didReceiveRetractMessage:)
                        name:kJJMessageRetractMessage
                      object:nil];
  
  
//  [defaultCenter addObserver:self
//                    selector:@selector(groupInfoChanged:)
//                        name:kJJMessageGroupInfoChanged
//                      object:nil];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(onSyncOfflineMessage:)
                        name:kJJMessageSyncOfflineMessage
                      object:nil];
  // have
  [defaultCenter addObserver:self
                    selector:@selector(onSyncRoamingMessage:)
                        name:kJJMessageSyncRoamingMessage
                      object:nil];
}

- (NSDictionary *)getParamError {
  return @{@"code": @(1), @"description": @"param error!"};
}

- (NSDictionary *)getErrorWithLog:(NSString *)log {
  return @{@"code": @(1), @"description": log};
}

- (NSDictionary *)getMediafileError {
  return @{@"code": @(2), @"description": @"media file not exit!"};
}

RCT_EXPORT_METHOD(setup:(NSDictionary *)param) {
  [[JMessageHelper shareInstance] initJMessage:param];
}

RCT_EXPORT_METHOD(setDebugMode:(NSDictionary *)param) {
  if (param[@"enable"]) {
    [JMessage setDebugMode];
  } else {
    [JMessage setLogOFF];
  }
}

#pragma mark IM - Notifications
- (void)onSyncOfflineMessage: (NSNotification *) notification {
  [self.bridge.eventDispatcher sendAppEventWithName:syncOfflineMessageEvent body:notification.object];
}

- (void)onSyncRoamingMessage: (NSNotification *) notification {
  [self.bridge.eventDispatcher sendAppEventWithName:syncRoamingMessageEvent body:notification.object];
}

-(void)didSendMessage:(NSNotification *)notification {
  NSDictionary *response = notification.object;
  
//  CDVPluginResult *result = nil;
    NSDictionary *msgDic = response[@"message"];
    NSArray *callBacks = self.SendMsgCallbackDic[msgDic[@"id"]];
  if (response[@"error"] == nil) {
    RCTResponseSenderBlock successCallback = callBacks[0];
    successCallback(@[msgDic]);
  } else {
    NSError *error = response[@"error"];
    RCTResponseSenderBlock failCallback = callBacks[1];
    failCallback(@[@{@"code": @(error.code), @"description": [error description]}]);
  }
  [self.SendMsgCallbackDic removeObjectForKey:msgDic[@"id"]];
}

- (void)loginStateChanged:(NSNotification *)notification{
  [self.bridge.eventDispatcher sendAppEventWithName:loginStateChangedEvent body:notification.object];
}

- (void)onContactNotify:(NSNotification *)notification{
  [self.bridge.eventDispatcher sendAppEventWithName:contactNotifyEvent body:notification.object];
}

- (void)didReceiveRetractMessage:(NSNotification *)notification{
  [self.bridge.eventDispatcher sendAppEventWithName:messageRetractEvent body:notification.object];
}

//didReceiveJMessageMessage change name
- (void)didReceiveJMessageMessage:(NSNotification *)notification {
  [self.bridge.eventDispatcher sendAppEventWithName:receiveMsgEvent body:notification.object];
}

//#pragma mark IM - User


RCT_EXPORT_METHOD(userRegister:(NSDictionary *)user
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
//  NSDictionary * user = [command argumentAtIndex:0];
  NSLog(@"username %@",user);

  [JMSGUser registerWithUsername: user[@"username"] password: user[@"password"] completionHandler:^(id resultObject, NSError *error) {
    if (!error) {
      successCallback(@[@{}]);
    } else {
      failCallback(@[[error errorToDictionary]]);
    }
  }];
}

RCT_EXPORT_METHOD(login:(NSDictionary *)user
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  [JMSGUser loginWithUsername:user[@"username"] password:user[@"password"] completionHandler:^(id resultObject, NSError *error) {
    if (!error) {
      successCallback(@[@{}]);
    } else {
      failCallback(@[[error errorToDictionary]]);
    }
  }];
}

RCT_EXPORT_METHOD(logout:(NSDictionary *)param) {
  [JMSGUser logout:^(id resultObject, NSError *error) {}];
}

RCT_EXPORT_METHOD(getMyInfo:(RCTResponseSenderBlock)successCallback) {
  JMSGUser *myInfo = [JMSGUser myInfo];
  if (myInfo.username == nil) {
    successCallback(@[@{}]);
  } else {
    successCallback(@[[myInfo userToDictionary]]);
  }
}

RCT_EXPORT_METHOD(getUserInfo:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if (param[@"username"]) {
    [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (!error) {
        NSArray *users = resultObject;
        JMSGUser *user = users[0];
        successCallback(@[[user userToDictionary]]);
      } else {
        failCallback(@[[error errorToDictionary]]);
      }
    }];
  } else {
    failCallback(@[[self getParamError]]);
    
  }
}

RCT_EXPORT_METHOD(updateMyPassword:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {

  if (param[@"oldPwd"] && param[@"newPwd"]) {
    [JMSGUser updateMyPasswordWithNewPassword:param[@"newPwd"] oldPassword:param[@"oldPwd"] completionHandler:^(id resultObject, NSError *error) {
      if (!error) {
        successCallback(@[@{}]);
      } else {
        failCallback(@[[error errorToDictionary]]);
      }
    }];
  } else {
    failCallback(@[[self getParamError]]);
  }
}


RCT_EXPORT_METHOD(updateMyAvatar:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (!param[@"imgPath"]) {
    failCallback(@[[self getParamError]]);
  }
  
  NSString *mediaPath = param[@"imgPath"];
  
  if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
    mediaPath = mediaPath;
    NSData *img = [NSData dataWithContentsOfFile: mediaPath];
    
    [JMSGUser updateMyInfoWithParameter:img userFieldType:kJMSGUserFieldsAvatar completionHandler:^(id resultObject, NSError *error) {
      if (!error) {
        successCallback(@[]);
      } else {
        failCallback(@[[error errorToDictionary]]);
      }
    }];
    
  } else {
    failCallback(@[[self getParamError]]);
  }
}

RCT_EXPORT_METHOD(updateMyInfo:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  JMSGUserInfo *info = [[JMSGUserInfo alloc] init];
  
  if (param[@"nickname"]) {
    info.nickname = param[@"nickname"];
  }
  
  if (param[@"birthday"]) {
    NSNumber *birthday = param[@"birthday"];
    info.birthday = birthday;
  }
  
  if (param[@"signature"]) {
    info.signature = param[@"signature"];
  }
  
  if (param[@"gender"]) {
    if ([param[@"gender"] isEqualToString:@"male"]) {
      info.gender = kJMSGUserGenderMale;
    }
    
    if ([param[@"gender"] isEqualToString:@"female"]) {
      info.gender = kJMSGUserGenderFemale;
    }
    
    if ([param[@"gender"] isEqualToString:@"unknow"]) {
      info.gender = kJMSGUserGenderUnknown;
    }
  }
  
  if (param[@"region"]) {
    info.region = param[@"region"];
  }
  
  if (param[@"address"]) {
    info.address = param[@"address"];
  }
  
  [JMSGUser updateMyInfoWithUserInfo:info completionHandler:^(id resultObject, NSError *error) {
    if (!error) {
      successCallback(@[]);
    } else {
      failCallback(@[[error errorToDictionary]]);
    }
  }];
}

- (JMSGOptionalContent *)convertDicToJMSGOptionalContent:(NSDictionary *)dic {
  JMSGCustomNotification *customNotification = [[JMSGCustomNotification alloc] init];
  JMSGOptionalContent *optionlContent = [[JMSGOptionalContent alloc] init];
  
  if(dic[@"isShowNotification"]) {
    NSNumber *isShowNotification = dic[@"isShowNotification"];
    optionlContent.noSaveNotification = ![isShowNotification boolValue];
  }
  
  if(dic[@"isRetainOffline"]) {
    NSNumber *isRetainOffline = dic[@"isRetainOffline"];
    optionlContent.noSaveOffline = ![isRetainOffline boolValue];
  }
  
  if(dic[@"isCustomNotificationEnabled"]) {
    NSNumber *isCustomNotificationEnabled = dic[@"isCustomNotificationEnabled"];
    customNotification.enabled= [isCustomNotificationEnabled boolValue];
  }
  
  if(dic[@"notificationTitle"]) {
    customNotification.title = dic[@"notificationTitle"];
  }
  
  if(dic[@"notificationText"]) {
    customNotification.alert = dic[@"notificationText"];
  }
  
  optionlContent.customNotification = customNotification;
  
  return optionlContent;
}


RCT_EXPORT_METHOD(sendTextMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {

    failCallback(@[[self getParamError]]);
    return;}
  
  if (param[@"text"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
    messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    JMSGTextContent *content = [[JMSGTextContent alloc] initWithText:param[@"text"]];
    JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           
                                           JMSGConversation *conversation = resultObject;
                                           self.SendMsgCallbackDic[message.msgId] = @[successCallback,failCallback];
                                           if (messageSendingOptions) {
                                             [conversation sendMessage:message optionalContent:messageSendingOptions];
                                           } else {
                                             [conversation sendMessage: message];
                                           }
                                         }];
    
  } else if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
    JMSGTextContent *content = [[JMSGTextContent alloc] initWithText:param[@"text"]];
    JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    
    self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
    if (messageSendingOptions) {
      [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
    } else {
      [JMSGMessage sendMessage:message];
    }
    
  } else {
    failCallback(@[[self getParamError]]);
  }
}

RCT_EXPORT_METHOD(sendImageMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if (param[@"path"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *mediaPath = param[@"path"];
  if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
    mediaPath = mediaPath;
  } else {
    failCallback(@[[self getMediafileError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
    messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    JMSGImageContent *content = [[JMSGImageContent alloc] initWithImageData: [NSData dataWithContentsOfFile: mediaPath]];
    
    content.uploadHandler = ^(float percent, NSString *msgID) {
      [self.bridge.eventDispatcher sendAppEventWithName:uploadProgressEvent body:@{@"messageId": msgID,
                                                                                   @"progress": @(percent)}];
    };
    
    JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           JMSGConversation *conversation = resultObject;
                                           self.SendMsgCallbackDic[message.msgId] = @[successCallback,failCallback];
                                           if (messageSendingOptions) {
                                             [conversation sendMessage:message optionalContent:messageSendingOptions];
                                           } else {
                                             [conversation sendMessage: message];
                                           }
                                         }];
    
  } else if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
    JMSGImageContent *content = [[JMSGImageContent alloc] initWithImageData: [NSData dataWithContentsOfFile: mediaPath]];
    
    content.uploadHandler = ^(float percent, NSString *msgID) {
      
      [self.bridge.eventDispatcher sendAppEventWithName:uploadProgressEvent body:@{@"messageId": msgID,
                                                                                   @"progress": @(percent)}];
    };
    
    JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    self.SendMsgCallbackDic[message.msgId] = @[successCallback,failCallback];
    if (messageSendingOptions) {
      [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
    } else {
      [JMSGMessage sendMessage:message];
    }
  } else {
    failCallback(@[[self getParamError]]);
  }
}

RCT_EXPORT_METHOD(sendVoiceMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if (param[@"path"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *mediaPath = param[@"path"];
  double duration = 0;
  if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]) {
    mediaPath = mediaPath;
    
    NSError *error = nil;
    AVAudioPlayer *avAudioPlayer = [[AVAudioPlayer alloc] initWithData:[NSData dataWithContentsOfFile:mediaPath] error: &error];
    if (error) {
      failCallback(@[[self getMediafileError]]);
    }
    
    duration = avAudioPlayer.duration;
    avAudioPlayer = nil;
    
  } else {
    failCallback(@[[self getMediafileError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
    messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    // send single text message
    JMSGVoiceContent *content = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile: mediaPath] voiceDuration:@(duration)];
    JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      JMSGConversation *conversation = resultObject;
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage: message];
      }
    }];
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      // send group text message
      JMSGVoiceContent *content = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile: mediaPath] voiceDuration:@(duration)];
      JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
      if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
        NSDictionary *extras = param[@"extras"];
        for (NSString *key in extras.allKeys) {
          [message updateMessageExtraValue: extras[key] forKey: key];
        }
      }
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [JMSGMessage sendMessage:message];
      }
    } else {
      failCallback(@[[self getParamError]]);
    }
  }
}

RCT_EXPORT_METHOD(sendCustomMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;}
  
  if (param[@"customObject"] == nil || ![param[@"customObject"] isKindOfClass:[NSDictionary class]]) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
    messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
    // send single text message
    JMSGCustomContent *content = [[JMSGCustomContent alloc] initWithCustomDictionary: param[@"customObject"]];
    JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
    
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGConversation *conversation = resultObject;
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage: message];
      }
    }];
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      // send group text message
      JMSGCustomContent *content = [[JMSGCustomContent alloc] initWithCustomDictionary: param[@"customObject"]];
      JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
      
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [JMSGMessage sendMessage:message];
      }
    } else {
      failCallback(@[[self getParamError]]);
    }
  }
}

RCT_EXPORT_METHOD(sendLocationMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
//  NSDictionary * param = [command argumentAtIndex:0];
  
  if (param[@"type"] == nil ||
      param[@"latitude"] == nil ||
      param[@"longitude"] == nil ||
      param[@"scale"] == nil ||
      param[@"address"] == nil) {
    failCallback(@[]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
    messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    JMSGLocationContent *content = [[JMSGLocationContent alloc] initWithLatitude:param[@"latitude"] longitude:param[@"longitude"] scale:param[@"scale"] address: param[@"address"]];
    JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGConversation *conversation = resultObject;
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage: message];
      }
    }];
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      JMSGLocationContent *content = [[JMSGLocationContent alloc] initWithLatitude:param[@"latitude"]
                                                                         longitude:param[@"longitude"]
                                                                             scale:param[@"scale"]
                                                                           address:param[@"address"]];
      JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId:param[@"groupId"]];
      if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
        NSDictionary *extras = param[@"extras"];
        for (NSString *key in extras.allKeys) {
          [message updateMessageExtraValue: extras[key] forKey: key];
        }
      }
      
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [JMSGMessage sendMessage:message];
      }
    } else {
      failCallback(@[[self getParamError]]);
    }
  }
}

RCT_EXPORT_METHOD(sendFileMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil ||
      param[@"path"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  NSString *fileName = @"";
  if (param[@"fileName"]) {
    fileName = param[@"fileName"];
  }
  NSString *mediaPath = param[@"path"];
  if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
    mediaPath = mediaPath;
  } else {
    failCallback(@[[self getMediafileError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  JMSGOptionalContent *messageSendingOptions = nil;
  if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
    messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    // send single text message
    JMSGFileContent *content = [[JMSGFileContent alloc] initWithFileData:[NSData dataWithContentsOfFile: mediaPath] fileName: fileName];
    
    content.uploadHandler = ^(float percent, NSString *msgID) {
      [self.bridge.eventDispatcher sendAppEventWithName:uploadProgressEvent body:@{@"messageId": msgID,
                                                                                   @"progress": @(percent)}];
    };
    
    JMSGMessage *message = [JMSGMessage createSingleMessageWithContent:content username: param[@"username"]];
    if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
      NSDictionary *extras = param[@"extras"];
      for (NSString *key in extras.allKeys) {
        [message updateMessageExtraValue: extras[key] forKey: key];
      }
    }
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      JMSGConversation *conversation = resultObject;
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage: message];
      }
    }];
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      // send group text message
      JMSGFileContent *content = [[JMSGFileContent alloc] initWithFileData:[NSData dataWithContentsOfFile: mediaPath] fileName: fileName];
      
      content.uploadHandler = ^(float percent, NSString *msgID) {
        [self.bridge.eventDispatcher sendAppEventWithName:uploadProgressEvent body:@{@"messageId": msgID,
                                                                                     @"progress": @(percent)}];
      };
      
      JMSGMessage *message = [JMSGMessage createGroupMessageWithContent: content groupId: param[@"groupId"]];
      if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
        NSDictionary *extras = param[@"extras"];
        for (NSString *key in extras.allKeys) {
          [message updateMessageExtraValue: extras[key] forKey: key];
        }
      }
      
      self.SendMsgCallbackDic[message.msgId] = @[successCallback, failCallback];
      if (messageSendingOptions) {
        [JMSGMessage sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [JMSGMessage sendMessage:message];
      }
    } else {
      failCallback(@[[self getParamError]]);
    }
  }
}

RCT_EXPORT_METHOD(getHistoryMessages:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
//  NSDictionary * param = [command argumentAtIndex:0];
  if (param[@"type"] == nil ||
      param[@"from"] == nil ||
      param[@"limit"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGConversation *conversation = resultObject;
      
      NSArray *messageList = [conversation messageArrayFromNewestWithOffset:param[@"from"] limit:param[@"limit"]];
      NSMutableArray *messageDicList = @[].mutableCopy;
      for (JMSGMessage *message in messageList) {
        [messageDicList addObject:[message messageToDictionary]];
      }
      successCallback(@[messageDicList]);
    }];
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          failCallback(@[[error errorToDictionary]]);
          return;
        }
        
        JMSGConversation *conversation = resultObject;
        NSArray *messageList = [conversation messageArrayFromNewestWithOffset:param[@"from"] limit:param[@"limit"]];
        NSMutableArray *messageDicList = @[].mutableCopy;
        for (JMSGMessage *message in messageList) {
          [messageDicList addObject:[message messageToDictionary]];
        }
        successCallback(@[messageDicList]);
      }];
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
}

RCT_EXPORT_METHOD(sendInvitationRequest:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"username"] == nil ||
      param[@"reason"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGFriendManager sendInvitationRequestWithUsername:param[@"username"]
                                                appKey:appKey
                                                reason:param[@"reason"]
                                     completionHandler:^(id resultObject, NSError *error) {
                                       if (error) {
                                         failCallback(@[[error errorToDictionary]]);
                                         return;
                                       }
                                       successCallback(@[]);
                                     }];
}

RCT_EXPORT_METHOD(acceptInvitation:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
//  NSDictionary * param = [command argumentAtIndex:0];
  if (param[@"username"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGFriendManager acceptInvitationWithUsername:param[@"username"]
                                           appKey:appKey
                                completionHandler:^(id resultObject, NSError *error) {
                                  if (error) {
                                    failCallback(@[[error errorToDictionary]]);
                                    return ;
                                  }
                                  successCallback(@[]);
                                }];
}

RCT_EXPORT_METHOD(declineInvitation:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {

  if (param[@"username"] == nil ||
      param[@"reason"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  [JMSGFriendManager rejectInvitationWithUsername:param[@"username"]
                                           appKey:appKey
                                           reason:param[@"reason"]
                                completionHandler:^(id resultObject, NSError *error) {
                                  if (error) {
                                    failCallback(@[[error errorToDictionary]]);
                                    return ;
                                  }
                                  successCallback(@[]);
                                }];
}

RCT_EXPORT_METHOD(removeFromFriendList:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"username"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGFriendManager removeFriendWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    successCallback(@[]);
  }];
}

RCT_EXPORT_METHOD(updateFriendNoteName:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"username"] == nil ||
      param[@"noteName"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    NSArray *userArr = resultObject;
    if (userArr.count < 1) {
      failCallback(@[[self getErrorWithLog:@"cann't find user by usernaem"]]);
    } else {
      JMSGUser *user = resultObject[0];
      [user updateNoteName:param[@"noteName"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          failCallback(@[[error errorToDictionary]]);
          return ;
        }
        successCallback(@[]);
      }];
    }
  }];
}

RCT_EXPORT_METHOD(updateFriendNoteText:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"username"] == nil ||
      param[@"noteText"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    NSArray *userArr = resultObject;
    if (userArr.count < 1) {
      failCallback(@[[self getErrorWithLog:@"cann't find user by usernaem"]]);
    } else {
      JMSGUser *user = resultObject[0];
      
      [user updateNoteName:param[@"noteText"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          failCallback(@[[error errorToDictionary]]);
          return ;
        }
        successCallback(@[]);
      }];
    }
  }];
}

RCT_EXPORT_METHOD(getFriends:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  [JMSGFriendManager getFriendList:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    NSArray *userList = resultObject;
    NSMutableArray *userDicList = @[].mutableCopy;
    for (JMSGUser *user in userList) {
      [userDicList addObject: [user userToDictionary]];
    }
    successCallback(@[userDicList]);
  }];
}

RCT_EXPORT_METHOD(createGroup:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  NSString *groupName = @"";
  NSString *descript = @"";
  
  if (param[@"name"] != nil) {
    groupName = param[@"name"];
  }
  
  if (param[@"desc"] != nil) {
    descript = param[@"desc"];
  }
  
  [JMSGGroup createGroupWithName:groupName desc:descript memberArray:nil completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    successCallback(@[[group groupToDictionary]]);
  }];
}

RCT_EXPORT_METHOD(getGroupIds:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  [JMSGGroup myGroupArray:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    NSArray *groudIdList = resultObject;
    successCallback(@[groudIdList]);
  }];
}

RCT_EXPORT_METHOD(getGroupInfo:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"id"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    successCallback(@[[group groupToDictionary]]);
  }];
}

RCT_EXPORT_METHOD(updateGroupInfo:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"id"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if (param[@"newName"] == nil && param[@"newDesc"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    NSString *newName = group.displayName;
    NSString *newDesc = group.description;
    
    if (param[@"newName"]) {
      newName = param[@"newName"];
    }
    
    if (param[@"newDesc"]) {
      newDesc = param[@"newDesc"];
    }
    
    [JMSGGroup updateGroupInfoWithGroupId:group.gid name:newName desc:newDesc completionHandler:^(id resultObject, NSError *error) {
      if (!error) {
        successCallback(@[]);
      } else {
        failCallback(@[[error errorToDictionary]]);
      }
    }];
  }];
}

RCT_EXPORT_METHOD(addGroupMembers:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"id"] == nil ||
      param[@"usernameArray"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    [group addMembersWithUsernameArray:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }
      
      successCallback(@[]);
    }];
  }];
}

RCT_EXPORT_METHOD(removeGroupMembers:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {

//  NSDictionary * param = [command argumentAtIndex:0];
  if (param[@"id"] == nil ||
      param[@"usernameArray"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    [group removeMembersWithUsernameArray:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }
      successCallback(@[]);
    }];
  }];
}

RCT_EXPORT_METHOD(exitGroup:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"id"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    [group exit:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }
      successCallback(@[]);
    }];
  }];
}

RCT_EXPORT_METHOD(getGroupMembers:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"id"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  [JMSGGroup groupInfoWithGroupId:param[@"id"] completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    JMSGGroup *group = resultObject;
    
    [group memberArrayWithCompletionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }
      NSArray *userList = resultObject;
      NSMutableArray *usernameList = @[].mutableCopy;
      for (JMSGUser *user in 	userList) {
        [usernameList addObject:[user username]];
      }
      successCallback(@[usernameList]);
    }];
  }];
}

RCT_EXPORT_METHOD(addUsersToBlacklist:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"usernameArray"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGUser addUsersToBlacklist:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (!error) {
      successCallback(@[]);
    } else {
      failCallback(@[[error errorToDictionary]]);
    }
  }];
}

RCT_EXPORT_METHOD(removeUsersFromBlacklist:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"usernameArray"] == nil) {
    failCallback(@[[self getParamError]]);
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  
  [JMSGUser delUsersFromBlacklist:param[@"usernameArray"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (!error) {
      successCallback(@[]);
    } else {
      failCallback(@[[error errorToDictionary]]);
    }
  }];
}

RCT_EXPORT_METHOD(getBlacklist:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  [JMessage blackList:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    NSArray *userList = resultObject;
    NSMutableArray *userDicList = @[].mutableCopy;
    for (JMSGUser *user in userList) {
      [userDicList addObject:[user userToDictionary]];
    }
    successCallback(@[userDicList]);
  }];
}

RCT_EXPORT_METHOD(setNoDisturb:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  NSNumber *isNoDisturb;
  if (param[@"type"] == nil ||
      param[@"isNoDisturb"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  isNoDisturb = param[@"isNoDisturb"];
  
  if ([param[@"type"] isEqualToString:@"single"]) {
    if (param[@"username"] == nil) {
      failCallback(@[[self getParamError]]);
      return;
    }
  } else {
    if ([param[@"type"] isEqualToString:@"group"]) {
      if (param[@"groupId"] == nil) {
        failCallback(@[[self getParamError]]);
        return;
      }
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
    
  }
  
  if ([param[@"type"] isEqualToString:@"single"]) {
    
    NSString *appKey = nil;
    if (param[@"appKey"]) {
      appKey = param[@"appKey"];
    } else {
      appKey = [JMessageHelper shareInstance].JMessageAppKey;
    }
    
    [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }
      
      NSArray *userList = resultObject;
      if (userList.count < 1) {
        successCallback(@[]);
        return;
      }
      
      JMSGUser *user = userList[0];
      [user setIsNoDisturb:[isNoDisturb boolValue] handler:^(id resultObject, NSError *error) {
        if (error) {
          failCallback(@[[error errorToDictionary]]);
          return ;
        }
        successCallback(@[]);
      }];
    }];
  }
  
  if ([param[@"type"] isEqualToString:@"group"]) {
    [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }
      
      JMSGGroup *group = resultObject;
      [group setIsNoDisturb:[isNoDisturb boolValue] handler:^(id resultObject, NSError *error) {
        if (error) {
          failCallback(@[[error errorToDictionary]]);
        }
        
        successCallback(@[]);
      }];
    }];
  }
}

RCT_EXPORT_METHOD(getNoDisturbList:(RCTResponseSenderBlock)successCallback
                      failCallback:(RCTResponseSenderBlock)failCallback) {
  [JMessage noDisturbList:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    NSArray *disturberList = resultObject;
    NSMutableArray *userDicList = @[].mutableCopy;
    NSMutableArray *groupDicList = @[].mutableCopy;
    for (id disturber in disturberList) {
      if ([disturber isKindOfClass:[JMSGUser class]]) {
        
        [userDicList addObject:[disturber userToDictionary]];
      }
      
      if ([disturber isKindOfClass:[JMSGGroup class]]) {
        [groupDicList addObject:[disturber groupToDictionary]];
      }
    }
    successCallback(@[@{@"userInfos": userDicList, @"groupInfos": groupDicList}]);
  }];
}

RCT_EXPORT_METHOD(setNoDisturbGlobal:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"isNoDisturb"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  [JMessage setIsGlobalNoDisturb:[param[@"isNoDisturb"] boolValue] handler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return;
    }
    successCallback(@[]);
  }];
}

RCT_EXPORT_METHOD(isNoDisturbGlobal:(RCTResponseSenderBlock)successCallback
                       failCallback:(RCTResponseSenderBlock)failCallback) {
  BOOL isNodisturb = [JMessage isSetGlobalNoDisturb];
  successCallback(@[@{@"isNoDisturb": @(isNodisturb)}]);
}

RCT_EXPORT_METHOD(downloadOriginalUserAvatar:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"username"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  [JMSGUser userInfoArrayWithUsernameArray:@[param[@"username"]] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return ;
    }
    
    NSArray *userList = resultObject;
    if (userList.count < 1) {
      successCallback(@[]);
      return;
    }
    
    JMSGUser *user = userList[0];
    [user largeAvatarData:^(NSData *data, NSString *objectId, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return ;
      }

      successCallback(@[@{@"username": user.username,
                          @"appKey": user.appKey,
                          @"filePath": [user largeAvatarLocalPath]}]);
    }];
  }];
  
}

RCT_EXPORT_METHOD(downloadOriginalImage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"messageId"] == nil ||
      param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  if ([param[@"type"] isEqual: @"single"]) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      JMSGConversation *conversation = resultObject;
      JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
      if (message == nil) {
        failCallback(@[[self getErrorWithLog:@"cann't find this message"]]);
        return;
      }
      
      if (message.contentType != kJMSGContentTypeImage) {
        failCallback(@[[self getErrorWithLog:@"It is not voice message"]]);
        return;
      } else {
        JMSGImageContent *content = (JMSGImageContent *) message.content;
        [content largeImageDataWithProgress:^(float percent, NSString *msgId) {
          
        } completionHandler:^(NSData *data, NSString *objectId, NSError *error) {
          if (error) {
            failCallback(@[[error errorToDictionary]]);
            return;
          }
          
          JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *) message.content;
          successCallback(@[@{@"messageId": message.msgId,
                              @"filePath": [mediaContent originMediaLocalPath]}]);
        }];
      }
    }];
  } else {
    [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGGroup *group = resultObject;
      [JMSGConversation createGroupConversationWithGroupId:group.gid completionHandler:^(id resultObject, NSError *error) {
        JMSGConversation *conversation = resultObject;
        JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
        
        if (message == nil) {
          failCallback(@[[self getErrorWithLog:@"cann't find this message"]]);
          return;
        }
        
        if (message.contentType != kJMSGContentTypeVoice) {
          failCallback(@[[self getErrorWithLog:@"It is not image message"]]);
          return;
        } else {
          JMSGImageContent *content = (JMSGImageContent *) message.content;
          [content largeImageDataWithProgress:^(float percent, NSString *msgId) {
            
          } completionHandler:^(NSData *data, NSString *objectId, NSError *error) {
            if (error) {
              failCallback(@[[error errorToDictionary]]);
              return;
            }
            JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *) message.content;
            successCallback(@[@{@"messageId": message.msgId,
                                @"filePath": [mediaContent originMediaLocalPath]}]);
          }];
        }
      }];
    }];
  }
}

RCT_EXPORT_METHOD(downloadVoiceFile:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"messageId"] == nil ||
      param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  if ([param[@"type"] isEqual: @"single"]) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           JMSGConversation *conversation = resultObject;
                                           JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                                           
                                           if (message == nil) {
                                             failCallback(@[[self getErrorWithLog:@"cann't find this message"]]);
                                             return;
                                           }
                                           
                                           if (message.contentType != kJMSGContentTypeVoice) {
                                             failCallback(@[[self getErrorWithLog:@"It is not image message"]]);
                                             return;
                                           } else {
                                             JMSGVoiceContent *content = (JMSGVoiceContent *) message.content;
                                             [content voiceData:^(NSData *data, NSString *objectId, NSError *error) {
                                               if (error) {
                                                 failCallback(@[[error errorToDictionary]]);
                                                 return;
                                               }
                                               
                                               JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *) message.content;
                                               failCallback(@[@{@"messageId": message.msgId,
                                                                @"filePath": [mediaContent originMediaLocalPath]}]);
                                             }];
                                           }
                                         }];
  } else {
    [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGGroup *group = resultObject;
      [JMSGConversation createGroupConversationWithGroupId:group.gid completionHandler:^(id resultObject, NSError *error) {
        JMSGConversation *conversation = resultObject;
        JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
        
        if (message == nil) {
          failCallback(@[[self getErrorWithLog:@"cann't find this message"]]);
          return;
        }
        
        if (message.contentType != kJMSGContentTypeVoice) {
          failCallback(@[[self getErrorWithLog:@"It is not voice message"]]);
          return;
        } else {
          JMSGVoiceContent *content = (JMSGVoiceContent *) message.content;
          [content voiceData:^(NSData *data, NSString *objectId, NSError *error) {
            if (error) {
              failCallback(@[[error errorToDictionary]]);
              return;
            }
            
            JMSGMediaAbstractContent *mediaContent = (JMSGMediaAbstractContent *)message.content;
            successCallback(@[@{@"messageId": message.msgId,
                                @"filePath": [mediaContent originMediaLocalPath]}]);
          }];
        }
      }];
    }];
  }
}

RCT_EXPORT_METHOD(downloadFile:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  if (param[@"messageId"] == nil ||
      param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  if ([param[@"type"] isEqual: @"single"]) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      JMSGConversation *conversation = resultObject;
      JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
      
      if (message == nil) {
        failCallback(@[[self getErrorWithLog:@"cann't find this message"]]);
        return;
      }
      
      if (message.contentType != kJMSGContentTypeFile) {
        failCallback(@[[self getErrorWithLog:@"It is not file message"]]);
        return;
      } else {
        JMSGFileContent *content = (JMSGFileContent *) message.content;
        [content fileData:^(NSData *data, NSString *objectId, NSError *error) {
          if (error) {
            failCallback(@[[error errorToDictionary]]);
            return;
          }
          JMSGFileContent *fileContent = (JMSGFileContent *) message.content;
          successCallback(@[@{@"messageId": message.msgId,
                              @"filePath":[fileContent originMediaLocalPath]}]);
        }];
      }
    }];
  } else {
    [JMSGGroup groupInfoWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGGroup *group = (JMSGGroup *) resultObject;
      [JMSGConversation createGroupConversationWithGroupId:group.gid completionHandler:^(id resultObject, NSError *error) {
        JMSGConversation *conversation = resultObject;
        JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
        
        if (message == nil) {
          failCallback(@[[self getErrorWithLog:@"Can't find the message"]]);
          return;
        }
        
        if (message.contentType != kJMSGContentTypeFile) {
          failCallback(@[[self getErrorWithLog:@"It is not a file message"]]);
          return;
          
        } else {
          JMSGFileContent *content = (JMSGFileContent *) message.content;
          [content fileData:^(NSData *data, NSString *objectId, NSError *error) {
            if (error) {
              
              failCallback(@[[error errorToDictionary]]);
              return;
            }
            JMSGFileContent *fileContent = (JMSGFileContent *) message.content;
            successCallback(@[@{@"messageId": message.msgId,
                                @"filePath":[fileContent originMediaLocalPath]}]);
          }];
        }
      }];
    }];
  }
}

RCT_EXPORT_METHOD(createConversation:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqualToString:@"single"]) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           JMSGConversation *conversation = resultObject;
                                           successCallback(@[[conversation conversationToDictionary]]);
                                         }];
  } else {
    [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      JMSGConversation *conversation = resultObject;
      successCallback(@[[conversation conversationToDictionary]]);
    }];
  }
  
}

RCT_EXPORT_METHOD(deleteConversation:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqualToString:@"single"]) {
    [JMSGConversation deleteSingleConversationWithUsername:param[@"username"] appKey:appKey];
  } else {
    [JMSGConversation deleteGroupConversationWithGroupId:param[@"groupId"]];
  }
  successCallback(@[]);
}

RCT_EXPORT_METHOD(getConversation:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqualToString:@"single"]) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           JMSGConversation *conversation = resultObject;
                                           successCallback(@[[conversation conversationToDictionary]]);
                                         }];
  } else {
    [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"]
                                       completionHandler:^(id resultObject, NSError *error) {
                                         if (error) {
                                           failCallback(@[[error errorToDictionary]]);
                                           return;
                                         }
                                         JMSGConversation *conversation = resultObject;
                                         successCallback(@[[conversation conversationToDictionary]]);
                                       }];
  }
}

RCT_EXPORT_METHOD(getConversations:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  [JMSGConversation allConversations:^(id resultObject, NSError *error) {
    if (error) {
      failCallback(@[[error errorToDictionary]]);
      return;
    }
    NSArray *conversationList = resultObject;
    NSMutableArray *conversationDicList = @[].mutableCopy;
    
    if (conversationList.count < 1) {
      successCallback(@[@[]]);
    } else {
      for (JMSGConversation *conversation in conversationList) {
        [conversationDicList addObject:[conversation conversationToDictionary]];
      }
      successCallback(@[conversationDicList]);
    }
  }];
}

RCT_EXPORT_METHOD(resetUnreadMessageCount:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      
    } else {
      failCallback(@[[self getParamError]]);
      return;
    }
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqualToString:@"single"]) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           JMSGConversation *conversation = resultObject;
                                           [conversation clearUnreadCount];
                                           successCallback(@[]);
                                         }];
    
  } else {
    [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"]
                                       completionHandler:^(id resultObject, NSError *error) {
                                         if (error) {
                                           failCallback(@[[error errorToDictionary]]);
                                           return;
                                         }
                                         JMSGConversation *conversation = resultObject;
                                         [conversation clearUnreadCount];
                                         successCallback(@[]);
                                       }];
  }
}

RCT_EXPORT_METHOD(retractMessage:(NSDictionary *)param
                  successCallback:(RCTResponseSenderBlock)successCallback
                  failCallback:(RCTResponseSenderBlock)failCallback) {
  
  if (param[@"type"] == nil) {
    failCallback(@[[self getParamError]]);
    return;}
  
  if (param[@"messageId"] == nil) {
    failCallback(@[[self getParamError]]);
    return;
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    // send single text message
    [JMSGConversation createSingleConversationWithUsername:param[@"username"]
                                                    appKey:appKey
                                         completionHandler:^(id resultObject, NSError *error) {
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           
                                           JMSGConversation *conversation = resultObject;
                                           JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                                           if (message == nil) {
                                             
                                             failCallback(@[[self getErrorWithLog:@"cann't found this message"]]);
                                             return;
                                           }
                                           
                                           [conversation retractMessage:message completionHandler:^(id resultObject, NSError *error) {
                                             if (error) {
                                               failCallback(@[[error errorToDictionary]]);
                                               return;
                                             }
                                             
                                             successCallback(@[]);
                                           }];
                                         }];
    
  } else {
    if ([param[@"type"] isEqual: @"group"] && param[@"groupId"] != nil) {
      // send group text message
      [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"]
                                         completionHandler:^(id resultObject, NSError *error) {
                                           
                                           if (error) {
                                             failCallback(@[[error errorToDictionary]]);
                                             return;
                                           }
                                           
                                           JMSGConversation *conversation = resultObject;
                                           JMSGMessage *message = [conversation messageWithMessageId:param[@"messageId"]];
                                           if (message == nil) {
                                             failCallback(@[[self getErrorWithLog:@"cann't found this message"]]);
                                             return;
                                           }
                                           
                                           [conversation retractMessage:message completionHandler:^(id resultObject, NSError *error) {
                                             if (error) {
                                               failCallback(@[[error errorToDictionary]]);
                                               return;
                                             }
                                             
                                             successCallback(@[]);
                                           }];
                                         }];
    } else {
      failCallback(@[[self getParamError]]);
    }
  }
}

RCT_EXPORT_METHOD(createSendMessage:(NSDictionary *)param
                  callback:(RCTResponseSenderBlock)callback) {
  /**
   *  {object} params = {
   *  'type': String,                                // 'single' / 'group'
   *  'messageType': String,                         // 'text', 'image', 'voice', 'location', 'file', 'custom'
   *  'groupId': String,                             // 当 type = group 时，groupId 不能为空
   *  'username': String,                            // 当 type = single 时，username 不能为空
   *  'appKey': String,                              // 当 type = single 时，用于指定对象所属应用的 appKey。如果为空，默认为当前应用。
   *  'text': String,                                // Optional 消息内容
   *  'path': String                                 // Optional 资源路径
   *  'fileName': String,                            // Optional 文件名
   *  'latitude': Number,                            // Optional 纬度信息
   *  'longitude': Number,                           // Optional 经度信息
   *  'scale': Number,                               // Optional 地图缩放比例
   *  'address': String,                             // Optional 详细地址信息
   *  'customObject': {'key1': 'value1'}  // Optional. Optional 自定义键值对
   *  'extras': Object,                              // Optional. 自定义键值对 = {'key1': 'value1'}
   * }
   */
  if (!param[@"type"]) {
    callback(@[]);
    return;
  }
  
  
  NSString *mediaPath = @"";
  if ([param[@"messageType"] isEqualToString:@"image"] ||
      [param[@"messageType"] isEqualToString:@"voice"] ||
      [param[@"messageType"] isEqualToString:@"file"]) {
     mediaPath = param[@"path"];
    if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]){
      mediaPath = mediaPath;
    } else {
      callback(@[[self getMediafileError]]);//TODO: fix
    }
  }
  
  JMSGAbstractContent *content = nil;
  if ([param[@"messageType"] isEqualToString:@"text"]) {
    content = [[JMSGTextContent alloc] initWithText:param[@"text"]];
  }
  
  if ([param[@"messageType"] isEqualToString:@"image"]) {
    content = [[JMSGImageContent alloc] initWithImageData: [NSData dataWithContentsOfFile: mediaPath]];
  }
  
  if ([param[@"messageType"] isEqualToString:@"voice"]) {
    double duration = 0;
    if([[NSFileManager defaultManager] fileExistsAtPath: mediaPath]) {
      mediaPath = mediaPath;
      
      NSError *error = nil;
      AVAudioPlayer *avAudioPlayer = [[AVAudioPlayer alloc] initWithData:[NSData dataWithContentsOfFile:mediaPath] error: &error];
      if (error) {
        callback(@[[self getMediafileError]]);
        return;
      }
      
      duration = avAudioPlayer.duration;
      avAudioPlayer = nil;
      
    } else {
      callback(@[[self getMediafileError]]);
      return;
    }
    
    content = [[JMSGVoiceContent alloc] initWithVoiceData:[NSData dataWithContentsOfFile: mediaPath] voiceDuration:@(duration)];
    
  
  }
  
  if ([param[@"messageType"] isEqualToString:@"location"]) {

    
    content = [[JMSGLocationContent alloc] initWithLatitude:param[@"latitude"]
                                                  longitude:param[@"longitude"]
                                                      scale:param[@"scale"]
                                                    address:param[@"address"]];
    
    
  }
  
  if ([param[@"messageType"] isEqualToString:@"file"]) {

    content = [[JMSGFileContent alloc] initWithFileData:[NSData dataWithContentsOfFile: mediaPath]
                                               fileName: param[@"fileName"]];
    
  }
  
  if ([param[@"messageType"] isEqualToString:@"custom"]) {
      content = [[JMSGCustomContent alloc] initWithCustomDictionary: param[@"customObject"]];
  }
  
  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
      [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          callback(@[[error errorToDictionary]]);
          return;
        }
        JMSGConversation *conversation = resultObject;
        JMSGMessage *message = [conversation createMessageWithContent:content];
        
        callback(@[[message messageToDictionary]]);
      }];
  } else {
      [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
        if (error) {
          callback(@[[error errorToDictionary]]);
          return;
        }
        JMSGConversation *conversation = resultObject;
        JMSGMessage *message = [conversation createMessageWithContent:content];
        if (param[@"extras"] && [param[@"extras"] isKindOfClass: [NSDictionary class]]) {
          NSDictionary *extras = param[@"extras"];
          for (NSString *key in extras.allKeys) {
            [message updateMessageExtraValue: extras[key] forKey: key];
          }
        }
        callback(@[[message messageToDictionary]]);
      }];
  }
}

RCT_EXPORT_METHOD(sendMessage:(NSDictionary *)param
              successCallback:(RCTResponseSenderBlock)successCallback
                 failCallBack:(RCTResponseSenderBlock)failCallback) {

  NSString *appKey = nil;
  if (param[@"appKey"]) {
    appKey = param[@"appKey"];
  } else {
    appKey = [JMessageHelper shareInstance].JMessageAppKey;
  }
  
  if ([param[@"type"] isEqual: @"single"] && param[@"username"] != nil) {
    [JMSGConversation createSingleConversationWithUsername:param[@"username"] appKey:appKey completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }
      
      JMSGConversation *conversation = resultObject;
      JMSGMessage *message = [conversation messageWithMessageId: param[@"id"]];
      
      if ([message.content isKindOfClass:[JMSGMediaAbstractContent class]]) {
        JMSGMediaAbstractContent *content = (JMSGMediaAbstractContent *)message.content;
        content.uploadHandler = ^(float percent, NSString *msgID) {

        [self.bridge.eventDispatcher sendAppEventWithName:uploadProgressEvent body:@{@"messageId": msgID,
                                                                                       @"progress": @(percent)}];
        };
      }
      
      JMSGOptionalContent *messageSendingOptions = nil;
      if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
      }
      
      self.SendMsgCallbackDic[message.msgId] = @[successCallback,failCallback];
      
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage:message];
      }
    }];
  } else {
    [JMSGConversation createGroupConversationWithGroupId:param[@"groupId"] completionHandler:^(id resultObject, NSError *error) {
      if (error) {
        failCallback(@[[error errorToDictionary]]);
        return;
      }

      JMSGConversation *conversation = resultObject;
      JMSGMessage *message = [conversation messageWithMessageId: param[@"id"]];
      
      if ([message.content isKindOfClass:[JMSGMediaAbstractContent class]]) {
        JMSGMediaAbstractContent *content = (JMSGMediaAbstractContent *)message.content;
        content.uploadHandler = ^(float percent, NSString *msgID) {
          [self.bridge.eventDispatcher sendAppEventWithName:uploadProgressEvent body:@{@"messageId": msgID,
                                                                                       @"progress": @(percent)}];
        };
      }
      
      JMSGOptionalContent *messageSendingOptions = nil;
      if (param[@"messageSendingOptions"] && [param[@"messageSendingOptions"] isKindOfClass: [NSDictionary class]]) {
        messageSendingOptions = [self convertDicToJMSGOptionalContent:param[@"messageSendingOptions"]];
      }
      
      self.SendMsgCallbackDic[message.msgId] = @[successCallback,failCallback];
      if (messageSendingOptions) {
        [conversation sendMessage:message optionalContent:messageSendingOptions];
      } else {
        [conversation sendMessage:message];
      }
      
    }];
  }
}


@end
