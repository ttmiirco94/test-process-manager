const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DataStore = sequelize.define('DataStore', {
    testID: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = DataStore;