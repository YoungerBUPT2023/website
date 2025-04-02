package com.itheima.pojo;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Father implements InitializingBean, DisposableBean {

    @Autowired
    private Son son;

    @PostConstruct
    public void initMethod(){
        System.out.println("Father...initMethod...");
    }

    @PreDestroy
    public void destroyMethod(){
        System.out.println("Father...destroyMethod...");
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("InitializingBean...afterPropertiesSet...执行了...");
    }

    @Override
    public void destroy() throws Exception {
        System.out.println("DisposableBean...destroy...执行了...");
    }
}
