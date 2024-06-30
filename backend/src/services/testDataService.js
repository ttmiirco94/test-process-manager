const createCustomLogger = require("../config/logger");
const TestData = require('../models/TestData');
const TestDataOutput = require('../models/TestDataOutput');

const logger = createCustomLogger('testDataService.js');

//---------------------------------------------------------------------
// FOR /TEST-DATA/
//---------------------------------------------------------------------

//NEED TESTING
exports.getTestData = async (testDataID, res) => {
    try {
        const testData = await TestData.findByPk(testDataID, {
            include: {
                model: TestDataOutput,
                as: 'TestDataOutputs'
            }
        });
        if (!testData) {
            logger.warn('Test data not found for ID: %s', testDataID);
            return res.status(404).json({ error: 'No TestData found for testDataID: %s', testDataID });
        }
        logger.info('Returning TestData for ID: %s', testDataID);
        res.status(200).json(testData);
    } catch (error) {
        logger.error('Error retrieving test data for ID: %s - %s', testDataID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//NEED TESTING
exports.storeTestData = async (testDataID, testData, res, wss) => {
    try {
        const testDataParent = await TestData.findByPk(testDataID);
        if (!testDataParent) {
            logger.warn('TestData ID not found: %s', testDataID);
            return res.status(404).json({ error: 'Test ID not found' });
        }
        await TestDataOutput.create({
            testDataID,
            message: testData.message
        });
        logger.info('Test data stored successfully for ID: %s', testDataID);
        res.status(200).json({ message: 'Test data stored successfully' });
    } catch (error) {
        logger.error('Error storing test data for ID: %s - %s', testDataID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
    //Implement "broadcastTestData(wss);
    //await broadcastTests(wss);
};

//NEED TESTING
exports.deleteTestData = async (testDataID, res, wss) => {
    try {
        const testData = await TestData.findByPk(testDataID);
        if (testData) {
            await testData.destroy();
            res.sendStatus(200);
        } else {
            logger.warn('TestData not found with ID: %s', testDataID);
            res.sendStatus(404);
        }
    } catch (error) {
        logger.error('Error deleting TestData with ID: %s - %s', testDataID, error.message);
        res.status(500).json({ error: `Error while deleting TestData with ID: ${testDataID}` });
    }
    //Implement "broadcastTestData(wss);
    //await broadcastTests(wss);
};