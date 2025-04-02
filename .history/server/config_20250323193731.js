module.exports = {
  DB_CONFIG: {
    host: 'localhost',
    user: 'root',  // 修改为root用户
    password: 'Uziismyking1020',  // 修改为新密码
    database: 'spacelab',
    dialect: 'mysql'
  },
  JWT_SECRET: 'Uziismyking1020',  // 用于JWT认证
  PORT: 5000,
  // 添加管理员配置
  ADMIN: {
    username: 'qydycg',    // 管理员用户名
    password: '1020'       // 管理员密码
  }
}; 