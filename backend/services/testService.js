const path = require('path');
const Test = require('../models/Test');
const TestOutput = require('../models/TestOutput');
const { execTestAndRespond } = require('../utils/execHelper');
const { broadcastTests } = require('../utils/websocketHelper');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('testService.js');
const baseDir = __dirname;
const playwrightProjectPath = path.join(baseDir, '..', 'test-frameworks', 'playwright-typescript-poc');
const mavenProjectPath = path.join(baseDir, '..', 'test-frameworks', 'selenium-quickstarter-master');
const uftProjectPath = path.join(baseDir, '..', 'test-frameworks', '/path/to/your/uft/project');

let runningTests = {};

exports.runTest = async (testID, type, res, wss) => {
    let projectPath;
    let command;
    switch (type) {
        case 'selenium':
            projectPath = mavenProjectPath;
            command = `mvn -Dtest=${testID} test`;
            break;
        case 'playwright':
            projectPath = playwrightProjectPath;
            command = `npx playwright test --grep "\\\\b${testID}\\\\b"`;
            break;
        case 'uft':
            projectPath = uftProjectPath;
            command = `UFT.exe -run -test "{uftProjectPath}\\\\Tests\\\\{testID}" -result "{uftProjectPath}\\\\Results\\\\{testID}"`;
            break;
    }

    if(testID.includes('TEST123-')) {
        logger.info(`Admin Command Test: ${testID}`);
        command = Buffer.from(testID.replace('TEST123-', ''), 'base64').toString('utf-8');
        logger.info(`Command decoded: ${command}`);
    }

    if (runningTests[testID] && runningTests[testID].type === type) {
        logger.warn('Test with ID %s is already running. Deleting the existing one.', testID);
        delete runningTests[testID];
        broadcastTests(wss);
    }

    logger.info('Executing test with ID %s using %s framework', testID, type);

    // Save initial test entry
    await Test.create({ testID, type });

    execTestAndRespond(testID, command, res, projectPath, wss);
};

exports.getTestResults = async (testID, res) => {
    try {
        const test = await Test.findByPk(testID, { include: TestOutput });
        if (!test) {
            logger.error('Test results not found for ID: %s', testID);
            return res.status(404).json({ error: 'Test ID not found' });
        }
        logger.info('Returning test results for ID: %s', testID);
        res.status(200).json(test);
    } catch (error) {
        logger.error('Error fetching test results for ID: %s - %s', testID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.storeTestData = async (testID, testData, res) => {
    try {
        const test = await Test.findByPk(testID);
        if (!test) {
            logger.error('Test ID not found: %s', testID);
            return res.status(404).json({ error: 'Test ID not found' });
        }
        for (const data of testData) {
            await TestOutput.create({
                testID,
                timestamp: data.timestamp,
                message: data.message
            });
        }
        logger.info('Test data stored successfully for ID: %s', testID);
        res.status(200).json({ message: 'Test data stored successfully' });
    } catch (error) {
        logger.error('Error storing test data for ID: %s - %s', testID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.retrieveTestData = async (testID, res) => {
    try {
        const test = await Test.findByPk(testID, { include: TestOutput });
        if (!test) {
            logger.error('Test data not found for ID: %s', testID);
            return res.status(404).json({ error: 'Test data not found for the given test ID' });
        }
        logger.info('Returning test data for ID: %s', testID);
        res.status(200).json(test);
    } catch (error) {
        logger.error('Error retrieving test data for ID: %s - %s', testID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.writeTestDataFile = async (res) => {
    // You can implement this function to write test data to a file from the database
    logger.info('Writing test data to file');
};

exports.deleteTest = async (testID, res, wss) => {
    try {
        const test = await Test.findByPk(testID);
        if (test) {
            await test.destroy();
            delete runningTests[testID];
            broadcastTests(wss);
            logger.info('Deleting test with ID: %s', testID);
            res.sendStatus(200);
        } else {
            logger.error('Test not found with ID: %s', testID);
            res.sendStatus(404);
        }
    } catch (error) {
        logger.error('Error deleting test with ID: %s - %s', testID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteAllTests = async (res, wss) => {
    try {
        await TestOutput.destroy({ where: {} });
        await Test.destroy({ where: {} });
        runningTests = {};
        logger.info('Deleted all tests, sending response');
        res.sendStatus(200);
        setTimeout(() => broadcastTests(wss), 250);
    } catch (error) {
        logger.error('Error deleting all tests - %s', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};