//
//  RCTJMessageModule.h
//  RCTJMessageModule
//
//  Created by oshumini on 2017/8/10.
//  Copyright © 2017年 HXHG. All rights reserved.
//

#import <Foundation/Foundation.h>

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#elif __has_include("React/RCTBridgeModule.h")
#import "React/RCTBridgeModule.h"
#endif

@interface RCTJMessageModule : NSObject<RCTBridgeModule>

@end
