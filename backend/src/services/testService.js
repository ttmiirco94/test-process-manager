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

//TODO: Outsource regular used db-functions to databaseHelper.js

//---------------------------------------------------------------------
// FOR /TESTS/
//---------------------------------------------------------------------

//IMPLEMENTED
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

//IMPLEMENTED
exports.getTestResults = async (testID, res) => {
    try {
        const test = await Test.findByPk(testID, {
            include: {
                model: TestOutput,
                as: 'TestOutputs'
            }
        });
        if (!test) {
            logger.warn('Test results not found for ID: %s', testID);
            return res.status(404).json({ error: 'Test results not found for the given test ID' });
        }
        logger.info('Returning test results for ID: %s', testID);
        res.status(200).json(test);
    } catch (error) {
        logger.error('Error retrieving test results for ID: %s - %s', testID, error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//IMPLEMENTED
exports.getAllTestResults = async (res) => {
    try {
        const test = await Test.findAll({
            include: {
                model: TestOutput,
                as: 'TestOutputs'
            }
        });
        if (!test) {
            logger.warn('Could not find any test result records');
            return res.status(404).json({ error: 'Could not find any test result' });
        }
        logger.info('Returning all test results:');
        res.status(200).json(test);
    } catch (error) {
        logger.error('Error retrieving all test results - %s', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//IMPLEMENTED
exports.deleteTest = async (testID, res, wss) => {
    try {
        const test = await Test.findByPk(testID);
        if (test) {
            await test.destroy();
            res.sendStatus(200);
        } else {
            logger.warn('Test not found with ID: %s', testID);
            res.sendStatus(404);
        }
    } catch (error) {
        logger.error('Error deleting test with ID: %s - %s', testID, error.message);
        res.status(500).json({ error: `Error while deleting test with ID: ${testID}` });
    }
    await broadcastTests(wss);
};

//IMPLEMENTED
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