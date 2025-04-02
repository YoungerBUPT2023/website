const { Sequelize } = require('sequelize');
const { DB_CONFIG } = require('./config');

const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.user,
  DB_CONFIG.password,
  {
    host: DB_CONFIG.host,
    dialect: DB_CONFIG.dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功。');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = sequelize; 