package com.itheima.initializer;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.util.HashMap;
import java.util.Map;

public class MyApplicationContextInitializer implements ApplicationContextInitializer {
    //ioc容器对象创建完毕后执行
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        //给上下文context对象注入环境属性
        //1.准备属性
        Map<String,Object> myMap = new HashMap<>();
        myMap.put("applicationName","big-event");

        //2.获取一个属性资源管理对象
        //获取的环境对象
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        //属性资源管理对象
        MutablePropertySources propertySources = environment.getPropertySources();

        //3.注册
        propertySources.addLast(new MapPropertySource("myMap",myMap));

        //int i = 1/0;
    }
}
