module.exports = {
  DB_CONFIG: {
    host: 'localhost',
    user: 'root',  // 使用root用户
    password: 'Uziismyking1020',  // 修改为正确的MySQL密码
    database: 'spacelab',  // 修改为小写，与您创建的数据库名称匹配
    dialect: 'mysql'
  },
  JWT_SECRET: 'Uziismyking1020',  // 用于JWT认证
  PORT: 5000,  // 将端口改回5000
  // 添加管理员配置
  ADMIN: {
    username: 'qydycg',    // 管理员用户名
    password: '1020'       // 管理员密码
  }
}; 