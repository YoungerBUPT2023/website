const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  detailedDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  equipment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requirements: {
    type: DataTypes.STRING,
    allowNull: true
  },
  collaborators: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

// 建立与用户的关联
Project.belongsTo(User, { foreignKey: 'authorId' });
User.hasMany(Project, { foreignKey: 'authorId' });

module.exports = Project; 