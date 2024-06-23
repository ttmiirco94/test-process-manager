const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const { setupBasicAuth } = require('./utils/auth');
const { initializeWebSocket } = require('./utils/websocketHelper');
const testRoutes = require('./routes/testRoutes');
const createCustomLogger = require('./config/logger');
const sequelize = require('./config/database');

const logger = createCustomLogger('server.js');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());
setupBasicAuth(app);
app.use('/api/tests', testRoutes);

// Set the WebSocket server instance in the app
app.set('wss', wss);

initializeWebSocket(wss);

sequelize.sync({ force: true }).then(() => {
    logger.info('Database synced');
    server.listen(3001, () => {
        logger.info('Server is listening on port 3001');
    });
}).catch(err => {
    logger.error('Failed to sync database: ', err);
});