const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");
const createCustomLogger = require("../config/logger");

const logger = createCustomLogger('logRoutes.js');

router.get('/', (req, res) => {
    const logFilePath = path.join(__dirname, '..', '..', 'combined.log');
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read log file' });
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    });
});

router.get('/v2', (req, res) => {
    logger.query({ order: 'desc', limit: 500 },
        (err, results) => {
            if (err) {
                res.status(500).send({ error: 'Error retrieving logs' });
            } else {
                res.send(results);
            }
        });
});

module.exports = router;