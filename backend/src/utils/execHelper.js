const {exec} = require('child_process');
const {broadcastTests} = require('./websocketHelper');
const createCustomLogger = require('../config/logger');
const path = require("path");
const TestOutput = require("../models/TestOutput");
const {findAndUpdateTestByTestID} = require("./databaseHelper");

const logger = createCustomLogger('execHelper.js');
const baseDir = __dirname;
const playwrightProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', 'playwright-typescript-poc');
const mavenProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', 'selenium-quickstarter-master');
const uftProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', '/path/to/your/uft/project');

exports.execTestAndRespond = async (testID, command, res, projectPath, wss) => {
    let result = {
        success: null,
        message: null,
        timestamp: null
    };
    let combinedOutput = '';
    const env = Object.assign({}, process.env, {
        STARTED_FROM_API: 'true'
    });

    logger.info('Executing command for test ID %s: %s', testID, command);
    const child = exec(command, {env, cwd: projectPath});

    child.stdout.on('data', (data) => {
        combinedOutput += data;
    });

    child.stderr.on('data', (data) => {
        combinedOutput += data;
    });

    await child.on('close', async (code) => {
        if(code !== 0) {
            logger.error(`Child process exited with code ${code}`);
        } else if(code === 0) {
            logger.info(`Child process exited with code ${code}`);
        }
        logger.info(`Full CommandLineTool output:`);
        logger.info(`${combinedOutput}`);
        result.message = Buffer.from(combinedOutput.trim()).toString('base64');
        result.success = code === 0;

        let testFramework;
        switch (true) {
            case projectPath.toLowerCase().includes('maven') || projectPath.toLowerCase().includes('java') || projectPath.toLowerCase().includes('selenium'):
                testFramework = 'Selenium';
                break;
            case projectPath.toLowerCase().includes('playwright') || projectPath.toLowerCase().includes('typescript'):
                testFramework = 'Playwright';
                break;
            case projectPath.toLowerCase().includes('uft'):
                testFramework = 'UFT';
                break;
            default:
                testFramework = 'No Framework detected';
        }

        logger.info('Test execution completed for ID %s with framework %s', testID, testFramework);
        let resultMessage = result.success ? '200:success' : '500:failed';
        try {
            logger.info('Save TestOutputs in database for ID %s', testID);
            await TestOutput.bulkCreate([
                {
                    testID,
                    message: result.message
                },
                {
                    testID,
                    message: resultMessage
                }
            ]);
        } catch (err) {
            logger.error('Error saving TestOutputs in database for ID %s: %s', testID, err.message);
        }

        await findAndUpdateTestByTestID(testID, {result: (result.success = code === 0)});
        res.sendStatus(result.success ? 200 : 500);
        await broadcastTests(wss);
    });
};