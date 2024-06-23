const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Test = require('./Test');

const TestOutput = sequelize.define('TestOutput', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    testID: {
        type: DataTypes.STRING,
        references: {
            model: Test,
            key: 'testID'
        }
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Test.hasMany(TestOutput, { foreignKey: 'testID' });
TestOutput.belongsTo(Test, { foreignKey: 'testID' });

module.exports = TestOutput;