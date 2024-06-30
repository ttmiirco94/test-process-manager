const createCustomLogger = require("../config/logger");
const DataStore = require('../models/DataStore');
const logger = createCustomLogger('testDataService.js');

//NEED TESTING
exports.getAllDataStoreRecords = async (res) => {
    try {
        const dataStore = await DataStore.findAll();
        if (!dataStore) {
            logger.warn('Could not find any data store records');
            return res.status(404).json({ error: 'Could not find any data store records'});
        }
        logger.info('Returning all data store records');
        res.status(200).json(dataStore);
    } catch (error) {
        logger.error('Error retrieving data store records - %s', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//NEED TESTING
exports.getDataStoreForTest = async (testID, res) => {
    try {
        const dataStore = await DataStore.findAll({where: { testID }});
        if (!dataStore) {
            logger.warn('Could not find any data store records with testID: %s', testID);
            return res.status(404).json({ error: `Could not find any data store records for testID: ${testID}`});
        }
        logger.info('Returning all data store records with testID: %s', testID);
        res.status(200).json(dataStore);
    } catch (error) {
        logger.error('Error retrieving data store records with testID: %s - %s', testID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//NEED TESTING
exports.getSpecificDataStoreForTest = async (testID, key, res) => {
    try {
        const dataStore = await DataStore.findAll({where: { testID: testID, key: key } });
        if (!dataStore) {
            logger.warn('Could not find any data store record with testID: %s and key: %s', testID, key);
            return res.status(404).json({ error: `Could not find any data store record for testID: ${testID} and key: ${key}`});
        }
        logger.info('Returning all data store record with testID: %s and key: %s', testID, key);
        res.status(200).json(dataStore);
    } catch (error) {
        logger.error('Error retrieving data store record with testID: %s and key: %s - %s', testID, key, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//NEED TESTING
exports.newDataStoreForTest = async (testID, key, value, res) => {
    try {
        const record = await DataStore.findOne({ where: { testID: testID, key: key } });
        if (!record) {
            logger.info('Save data store testID: %s, key: %s and value: %s', testID, key, value);
            await DataStore.create({ testID, key, value });
            return res.status(200);
        } else {
            logger.info('Record already exists - current value: %s updating value: %s', record.value, value);
            record.value = value;
            await record.save();
            return res.status(200).json(record);
        }
    } catch (error) {
        logger.error('Error creating/updating data store record with testID: %s and key: %s - %s', testID, key, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};