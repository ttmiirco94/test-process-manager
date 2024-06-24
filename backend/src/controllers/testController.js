const testService = require('../services/testService');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('testController.js');

//---------------------------------------------------------------------
// FOR /TESTS/
//---------------------------------------------------------------------

exports.runSeleniumTest = async (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Starting Selenium test with ID: %s', testID);
    await testService.runTest(testID, 'selenium', res, wss);
};

exports.runPlaywrightTest = async (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Starting Playwright test with ID: %s', testID);
    await testService.runTest(testID, 'playwright', res, wss);
};

exports.runUFTTest = async (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Starting UFT test with ID: %s', testID);
    await testService.runTest(testID, 'uft', res, wss);
};

//TODO: Maybe "runCustomCommand" in the future?

exports.getTestResults = async (req, res) => {
    const testID = req.params.testID;
    logger.info('Retrieving test results for ID: %s', testID);
    await testService.getTestResults(testID, res);
};

exports.deleteTest = async (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Deleting test with ID: %s', testID);
    await testService.deleteTest(testID, res, wss);
};

exports.deleteAllTests = async (req, res, wss) => {
    logger.info('Deleting all tests');
    await testService.deleteAllTests(res, wss);
};

//---------------------------------------------------------------------
// FOR /TEST-DATA/
//---------------------------------------------------------------------

exports.getTestData = async (req, res) => {
    const testDataID = req.params.testDataID;
    logger.info('Retrieving test data for ID: %s', testDataID);
    await testService.getTestData(testDataID, res);
};

exports.storeTestData = async (req, res) => {
    const testDataID = req.params.testDataID;
    const testData = req.body;
    logger.info('Saving test data for ID: %s', testDataID);
    await testService.storeTestData(testDataID, testData, res);
};

exports.deleteTestData = async (req, res, wss) => {
    const testDataID = req.params.testDataID;
    logger.info('Deleting test data with ID: %s', testDataID);
    await testService.deleteTestData(testDataID, res, wss);
};