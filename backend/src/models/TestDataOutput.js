const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TestData = require('./TestData');

const TestDataOutput = sequelize.define('TestDataOutput', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    testDataID: {
        type: DataTypes.STRING,
        references: {
            model: TestData,
            key: 'testDataID'
        }
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    data: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

TestData.hasMany(TestDataOutput, { foreignKey: 'testDataID', as: 'TestDataOutputs', onDelete: 'CASCADE' });
TestDataOutput.belongsTo(TestData, { foreignKey: 'testDataID', as: 'TestData' });

module.exports = TestDataOutput;