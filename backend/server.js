const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment-timezone');
const basicAuth = require('express-basic-auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());

// Setup basic auth
app.use(basicAuth({
    users: { 'admin': 'admin123!' },
    challenge: true,
    unauthorizedResponse: (req) => 'Unauthorized'
}));

let runningTests = {};

app.put('/selenium-test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        return res.status(400).json({ error: 'Test ID already exists' });
    }
    runningTests[testID] = { type: 'selenium', output: [] };
    broadcastTests();
    res.sendStatus(200);
});

app.put('/playwright-test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        return res.status(400).json({ error: 'Test ID already exists' });
    }
    runningTests[testID] = { type: 'playwright', output: [] };
    broadcastTests();
    res.sendStatus(200);
});

app.put('/uft-test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        return res.status(400).json({ error: 'Test ID already exists' });
    }
    runningTests[testID] = { type: 'uft', output: [] };
    broadcastTests();
    res.sendStatus(200);
});

app.post('/test-output/:testID', (req, res) => {
    const testID = req.params.testID;
    const output = req.body.output;
    const timestamp = moment().tz('Europe/Berlin').format('YYYY-MM-DD HH:mm:ss');
    if (!runningTests[testID]) {
        return res.status(404).json({ error: 'Test ID not found' });
    }
    runningTests[testID].output.push({ message: output, timestamp });
    broadcastTests();
    res.sendStatus(200);
});

app.delete('/test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        delete runningTests[testID];
        broadcastTests();
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.delete('/tests', (req, res) => {
    runningTests = {};
    broadcastTests();
    res.sendStatus(200);
});

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(runningTests));
});

function broadcastTests() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(runningTests));
        }
    });
}

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
