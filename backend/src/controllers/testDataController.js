const createCustomLogger = require("../config/logger");
const testDataService = require("../services/testDataService");

const logger = createCustomLogger('testDataController.js');

//---------------------------------------------------------------------
// FOR /TEST-DATA/
//---------------------------------------------------------------------

exports.getTestData = async (req, res) => {
    const testDataID = req.params.testDataID;
    logger.info('Retrieving test data for ID: %s', testDataID);
    await testDataService.getTestData(testDataID, res);
};

exports.storeTestData = async (req, res, wss) => {
    const testDataID = req.params.testDataID;
    const testData = req.body;
    logger.info('Saving test data for ID: %s', testDataID);
    await testDataService.storeTestData(testDataID, testData, res, wss);
};

exports.deleteTestData = async (req, res, wss) => {
    const testDataID = req.params.testDataID;
    logger.info('Deleting test data with ID: %s', testDataID);
    await testDataService.deleteTestData(testDataID, res, wss);
};