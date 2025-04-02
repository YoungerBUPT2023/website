package com.itheima.processor;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.GenericBeanDefinition;
import org.springframework.stereotype.Component;

@Component
public class MyBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    //当beanFactory被实例化好后(bean创建之前),回调这个函数,注册一些BeanDefinition
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        //注册一个Teacher的BeanDefinition
        GenericBeanDefinition gbdf = new GenericBeanDefinition();
        gbdf.setBeanClass(Teacher.class);

        //向下强转
        DefaultListableBeanFactory dbf = (DefaultListableBeanFactory) beanFactory;

        dbf.registerBeanDefinition("teacher",gbdf);
    }
}
