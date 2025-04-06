const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const LabMessage = sequelize.define('LabMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // 根据实际表结构添加其他字段
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'labmessages' // 确保表名匹配
});

// 如果有关联关系，可以在这里定义
// 例如，如果消息与用户相关联：
LabMessage.belongsTo(User);

module.exports = LabMessage; 