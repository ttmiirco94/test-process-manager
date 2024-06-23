const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Test = sequelize.define('Test', {
    testID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    result: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
});

module.exports = Test;