const { Sequelize } = require('sequelize');
const path = require('path');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('database.js');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
    //logging: ((sql, timing) => logger.info(sql, timing))
});

module.exports = sequelize;