const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Project = require('./Project');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// 建立关联关系
Comment.belongsTo(User);
Comment.belongsTo(Project);
User.hasMany(Comment);
Project.hasMany(Comment);

module.exports = Comment; 