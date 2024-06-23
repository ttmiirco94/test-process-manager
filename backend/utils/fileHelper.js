const fs = require('fs');
const moment = require('moment-timezone');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('fileHelper.js');

const filePath = 'test-data/testDataStorage.json';

exports.cleanUp = (data) => {
    return data.output
        .replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]/g, '')
        .replace(/[›@\\/:.<>|]/g, '')
        .replace(/["']/g, '')
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

exports.writeDataToFile = (testDataStorage, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        let existingData = {};

        if (err && err.code !== 'ENOENT') {
            logger.error('Error reading file: %s', err.message);
            return res.status(500).json({ error: 'Failed to read test data file' });
        }

        if (!err) {
            try {
                existingData = JSON.parse(data);
            } catch (parseErr) {
                logger.error('Error parsing existing data: %s', parseErr.message);
                return res.status(500).json({ error: 'Failed to parse existing test data' });
            }
        }

        for (const testID in testDataStorage) {
            if (existingData[testID]) {
                existingData[testID] = existingData[testID].concat(testDataStorage[testID]);
            } else {
                existingData[testID] = testDataStorage[testID];
            }
        }

        fs.writeFile(filePath, JSON.stringify(existingData, null, 2), (writeErr) => {
            if (writeErr) {
                logger.error('Error writing to file: %s', writeErr.message);
                return res.status(500).json({ error: 'Failed to save test data' });
            }
            logger.info('Test data saved successfully to %s', filePath);
            res.status(200).json({ message: 'Test data saved successfully', filePath });
        });
    });
};