const createCustomLogger = require('../config/logger');
const {getTestsAndOutputs} = require("./databaseHelper");

const logger = createCustomLogger('websocketHelper.js');

exports.initializeWebSocket = async (wss) => {
    logger.info('Initialize WebSocket');
    await wss.on('connection', async (ws) => {
        await getTestsAndOutputs().then(results => {
            //logger.info(JSON.stringify(results, null, 2));
            ws.send(JSON.stringify(results));
        }).catch(error => {
            logger.error('Broadcasting tests failed: ', error);
        });
    });
};

exports.broadcastTests = async (wss) => {
    logger.info('Broadcasting tests to all WebSocket clients');
    await getTestsAndOutputs().then(results => {
        //logger.info(JSON.stringify(results, null, 2));
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(results));
            }
        });
    }).catch(error => {
        logger.error('Broadcasting tests failed: ', error);
    });
};