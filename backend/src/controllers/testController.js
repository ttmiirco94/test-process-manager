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

exports.getTestResults = async (req, res) => {
    const testID = req.params.testID;
    logger.info('Retrieving test results for ID: %s', testID);
    await testService.getTestResults(testID, res);
};

exports.storeTestData = (req, res) => {
    const testID = req.params.testID;
    const testData = req.body;
    logger.info('Storing test data for ID: %s', testID);
    testService.storeTestData(testID, testData, res);
};

exports.getTestData = async (req, res) => {
    const testID = req.params.testID;
    logger.info('Retrieving test data for ID: %s', testID);
    await testService.getTestData(testID, res);
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