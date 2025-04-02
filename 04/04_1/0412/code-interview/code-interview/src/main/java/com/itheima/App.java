package com.itheima;

import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(App.class, args);
        //属性不是打印出去
       /* String applicationName = context.getEnvironment().getProperty("applicationName");
        System.out.println(applicationName);*/
        //AnnotationConfigServletWebServerApplicationContext: 最终得到的容器的类型
       /* System.out.println(context.getClass());
        App appBean = context.getBean(App.class);
        System.out.println(appBean);*/

        //获取BeanDefinition对象
        /*ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
        BeanDefinition userBdf = beanFactory.getBeanDefinition("user");
        BeanDefinition aaBdf = beanFactory.getBeanDefinition("aa");
        System.out.println(userBdf.getClass());
        System.out.println(aaBdf.getClass());*/
        System.out.println(context.getBean("teacher"));
    }
}
