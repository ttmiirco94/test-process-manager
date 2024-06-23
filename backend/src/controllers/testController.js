const testService = require('../services/testService');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('testController.js');

exports.runSeleniumTest = (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Running Selenium test with ID: %s', testID);
    testService.runTest(testID, 'selenium', res, wss);
};

exports.runPlaywrightTest = (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Running Playwright test with ID: %s', testID);
    testService.runTest(testID, 'playwright', res, wss);
};

exports.runUFTTest = (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Running UFT test with ID: %s', testID);
    testService.runTest(testID, 'uft', res, wss);
};

exports.getTestResults = (req, res) => {
    const testID = req.params.testID;
    logger.info('Retrieving test results for ID: %s', testID);
    testService.getTestResults(testID, res);
};

exports.storeTestData = (req, res) => {
    const testID = req.params.testID;
    const testData = req.body;
    logger.info('Storing test data for ID: %s', testID);
    testService.storeTestData(testID, testData, res);
};

exports.retrieveTestData = (req, res) => {
    const testID = req.params.testID;
    logger.info('Retrieving test data for ID: %s', testID);
    testService.retrieveTestData(testID, res);
};

exports.writeTestDataFile = (req, res) => {
    logger.info('Writing test data to file');
    testService.writeTestDataFile(res);
};

exports.deleteTest = (req, res, wss) => {
    const testID = req.params.testID;
    logger.info('Deleting test with ID: %s', testID);
    testService.deleteTest(testID, res, wss);
};

exports.deleteAllTests = (req, res, wss) => {
    logger.info('Deleting all tests');
    testService.deleteAllTests(res, wss);
};