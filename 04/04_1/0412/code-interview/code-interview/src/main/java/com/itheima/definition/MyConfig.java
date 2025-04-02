package com.itheima.definition;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyConfig {

    @Bean//ConfigurationClassBeanDefinition 描述
    public String aa(){
        return "我爱所有的美女";
    }
}
