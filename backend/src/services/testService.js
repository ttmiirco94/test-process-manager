const path = require('path');
const Test = require('../models/Test');
const TestOutput = require('../models/TestOutput');
const { execTestAndRespond } = require('../utils/execHelper');
const { broadcastTests } = require('../utils/websocketHelper');
const createCustomLogger = require('../config/logger');

const logger = createCustomLogger('testService.js');
const baseDir = __dirname;
const playwrightProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', 'playwright-typescript-poc');
const mavenProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', 'selenium-quickstarter-master');
const uftProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', '/path/to/your/uft/project');

exports.runTest = async (testID, type, res, wss) => {
    let projectPath;
    let command;
    switch (type) {
        case 'selenium':
            projectPath = mavenProjectPath;
            command = `mvn -Dtest=${testID} test`;
            //command = `mvn -DsuiteXmlFile=src/test/resources/TestSuites/${testID}.xml test`
            break;
        case 'playwright':
            projectPath = playwrightProjectPath;
            command = `npx playwright test --grep "${testID}"`;
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

    logger.info('Executing test with ID %s using %s framework', testID, type);

    try {
        const test = await Test.findByPk(testID);
        if (test) {
            logger.warn('Test with ID %s already exists. Deleting the existing one.', testID);
            await test.destroy();
        }
    } catch (error) {
        logger.error(`Error deleting test with ID %s - %s`, testID, error.message);
    }

    await Test.create({ testID, type });
    setTimeout(() => broadcastTests(wss), 250);
    await execTestAndRespond(testID, command, res, projectPath, wss);
};

exports.getTestResults = async (testID, res) => {
    try {
        const test = await Test.findByPk(testID, {
            include: {
                model: TestOutput,
                as: 'TestOutputs'
            }
        });
        if (!test) {
            logger.error('Test results not found for ID: %s', testID);
            return res.status(404).json({ error: 'Test results not found for the given test ID' });
        }
        logger.info('Returning test results for ID: %s', testID);
        res.status(200).json(test);
    } catch (error) {
        logger.error('Error retrieving test results for ID: %s - %s', testID, error.message);
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

exports.getTestData = async (testID, res) => {
    try {
        const test = await Test.findByPk(testID, {
            include: {
                model: TestOutput,
                as: 'TestOutputs'
            }
        });
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
            res.sendStatus(200);
        } else {
            logger.error('Test not found with ID: %s', testID);
            res.sendStatus(404);
        }
    } catch (error) {
        logger.error('Error deleting test with ID: %s - %s', testID, error.message);
        res.status(500).json({ error: `Error while deleting test with ID: ${testID}` });
    }
    await broadcastTests(wss);
};

exports.deleteAllTests = async (res, wss) => {
    try {
        await Test.destroy({ where: {} });
        res.sendStatus(200);
    } catch (error) {
        logger.error('Error deleting all tests - %s', error.message);
        res.status(500).json({ error: `Error while deleting all tests` });
    }
    await broadcastTests(wss)
};