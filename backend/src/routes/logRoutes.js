const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");

//TODO: LogViewer in React und hier auf JSON umstellen (nicht text/plain), da combinedLog JSON Format hat
router.get('', (req, res) => {
    const logFilePath = path.join(__dirname, '..', '..', 'combined.log');
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read log file' });
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    });
});

module.exports = router;