package com.itheima.listener;

import org.springframework.boot.context.event.ApplicationFailedEvent;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;

public class MyListener implements ApplicationListener {
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        //ApplicationEvent event 对应的就是发布的事件,ApplicationReadyEvent,ApplicationFailedEvent
        if (event instanceof ApplicationReadyEvent){
            //容器初始化成功
            System.out.println("MyListener...容器初始化成功...");
        }

        if (event instanceof ApplicationFailedEvent){
            //容器初始化失败
            System.out.println("MyListener...容器初始化失败...");
        }
    }
}
