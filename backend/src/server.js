const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const { setupBasicAuth } = require('./utils/auth');
const { initializeWebSocket} = require('./utils/websocketHelper');
const testRoutes = require('./routes/testRoutes');
const logRoutes = require('./routes/logRoutes');
const testDataRoutes = require('./routes/testDataRoutes');
const dataStoreRoutes = require('./routes/dataStoreRoutes')
const createCustomLogger = require('./config/logger');
const sequelize = require('./config/database');
const path = require('path');
const fs = require('fs');
const moment = require("moment");

const logger = createCustomLogger('server.js');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const dbFilePath = path.join(__dirname, '../database.sqlite');

app.use(cors());
app.use(bodyParser.json());
setupBasicAuth(app);

app.use('/api/tests', testRoutes);
app.use('/logs', logRoutes);
app.use('/api/data-store', dataStoreRoutes);

app.set('wss', wss);

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at: ' + promise + ' reason: ' + reason instanceof Error ? reason.message : reason);
});

sequelize.sync().then(() => {
    logger.info('Existing Database synced');
    server.listen(3001, () => {
        logger.info('Server is listening on port 3001');
    });
}).catch(err => {
    logger.error('Failed to sync database: ', err);
    logger.info('Backup existing db and creating a new DB');
    if (fs.existsSync(dbFilePath)) {
        const backupFileName = `backup_database_${moment().format('DDMMYYYY_HHmm')}.sqlite`;
        const backupFilePath = path.join(__dirname, '..', backupFileName);
        fs.rename(dbFilePath, backupFilePath, (renameErr) => {
            if (renameErr) {
                logger.error('Failed to rename database file: ', renameErr);
                logger.error('Application will now force shutdown.');
                process.exit(1);
            } else {
                logger.info(`Database backup file renamed to ${backupFileName}`);
            }
        });

        sequelize.sync({ force: true }).then(() => {
            logger.info('New Database synced');
            server.listen(3001, () => {
                logger.info('Server is listening on port 3001');
            });
        }).catch(err => {
            logger.error('Failed to sync new created database: ', err);
            logger.error('Application will now force shutdown.');
            process.exit(1);
        });
    }
});
setTimeout(() => initializeWebSocket(wss), 500);