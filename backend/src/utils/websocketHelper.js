const createCustomLogger = require('../config/logger');
const {getTestsAndOutputs} = require("./databaseHelper");

const logger = createCustomLogger('websocketHelper.js');

exports.initializeWebSocket = (wss) => {
    wss.on('connection', (ws) => {
        getTestsAndOutputs().then(results => {
            logger.info(JSON.stringify(results, null, 2));
            ws.send(JSON.stringify(results));
        }).catch(error => {
            logger.error(error);
        });
        logger.info('New WebSocket connection established. Sending tests');
    });
};

exports.broadcastTests = (wss) => {
    getTestsAndOutputs().then(results => {
        logger.info(JSON.stringify(results, null, 2));
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(results));
            }
        });
    }).catch(error => {
        logger.error(error);
    });
    logger.info('Broadcast tests to all WebSocket clients');
};