const { DataTypes } = require('sequelize');
const { sequelize } = require('./sequelize');

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['board', 'volunteer']]
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'TeamMembers'
});

module.exports = TeamMember;
