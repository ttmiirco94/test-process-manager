const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestData = sequelize.define('TestData', {
    testDataID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    additionalInfo: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = TestData;