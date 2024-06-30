const dataStoreService = require('../services/dataStoreService');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('dataStoreController.js');

//Return all key+value records containing testID
exports.getAllDataStoreRecords = async (req, res) => {
    logger.info('Retrieving all data store records');
    await dataStoreService.getAllDataStoreRecords(res);
};

//Return all key+value records containing testID
exports.getDataStoreForTest = async (req, res) => {
    const testID = req.params.testID;
    logger.info('Retrieving data store for testID: %s', testID);
    await dataStoreService.getDataStoreForTest(testID, res);
};

//Return the value of given testID+key record
exports.getSpecificDataStoreForTest = async (req, res) => {
    const testID = req.params.testID;
    const key = req.params.key
    logger.info('Retrieving data store for testID: %s and key: %s', testID, key);
    await dataStoreService.getSpecificDataStoreForTest(testID, key, res);
};

//Add new record with testID, key, value
//If pair testID+key exists, update record
exports.newDataStoreForTest = async (req, res, wss) => {
    const testID = req.params.testID;
    const key = req.body["key"]
    const valueOfKey = req.body["value"];
    logger.info('New data store for testID: %s, with key: %s and value: %s', testID, key, valueOfKey);
    await dataStoreService.newDataStoreForTest(testID, key, valueOfKey, res, wss);
};

//TODO: implement dataStoreService function
//Delete all records containing testID
exports.deleteDataStoreForTest = async (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Deleting data store for testID: %s', testID);
    //await testDataService.deleteTestData(testID, res, wss);
};

const test = {"test":"value"};