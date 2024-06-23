const basicAuth = require('express-basic-auth');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('auth.js');

exports.setupBasicAuth = (app) => {
    app.use(basicAuth({
        users: { 'admin': 'admin123!' },
        challenge: true,
        unauthorizedResponse: (req) => {
            logger.warn('Unauthorized access attempt');
            return 'Unauthorized';
        }
    }));
};