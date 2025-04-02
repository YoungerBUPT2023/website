const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Project = require('./Project');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
});

// 建立关联关系
Like.belongsTo(User);
Like.belongsTo(Project);
User.hasMany(Like);
Project.hasMany(Like);

module.exports = Like; 