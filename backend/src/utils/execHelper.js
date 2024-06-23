const { exec, execSync } = require('child_process');
const { cleanUp } = require('./fileHelper');
const { broadcastTests } = require('./websocketHelper');
const createCustomLogger = require('../config/logger');
const path = require("path");
const fs = require("fs");

const logger = createCustomLogger('execHelper.js');
const baseDir = __dirname;
const playwrightProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', 'playwright-typescript-poc');
const mavenProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', 'selenium-quickstarter-master');
const uftProjectPath = path.join(baseDir, '..', '..', '..', 'test-frameworks', '/path/to/your/uft/project');

let latestTestResults = {};
let runningTests = {};

exports.execTestAndRespond = (testID, command, res, projectPath, wss) => {
    let result = {
        success: null,
        output: null,
        timestamp: new Date().toISOString()
    };
    let combinedOutput = '';
    const env = Object.assign({}, process.env, {
        STARTED_FROM_API: 'true'
    });

    // Check permissions (simple check for read/write access)
    try {
        fs.accessSync(projectPath, fs.constants.R_OK | fs.constants.W_OK);
        logger.info('Read and write permissions are available for the directory:', projectPath);
    } catch (err) {
        logger.error('Permission error:', err.message);
    }

    logger.info('Executing command for test ID %s: %s', testID, command);
    //projectPath = projectPath.replace(/\\/g, '\\\\');
    //command = `cd ${projectPath} && ${command}`;
    const child = exec(command, { env, cwd: projectPath });
    //const child = exec(command, { env, cwd: projectPath });
    //const child = exec(command, { env, cwd: projectPath });
    //const childOldd = exec(command, { env });
    //const childOld = exec(command, { env, cwd: projectPath });

    child.stdout.on('data', (data) => {
        combinedOutput += data;
    });

    child.stderr.on('data', (data) => {
        combinedOutput += data;
    });

    child.on('close', (code) => {
        logger.info(`Child process exited with code ${code}`);
        logger.info(`Combined output: ${combinedOutput}`);
        result.output = Buffer.from(combinedOutput.trim()).toString('base64');
        result.success = code === 0;
        latestTestResults = result;

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
        runningTests[testID] = { type: testFramework, output: [] };

        logger.info('Test execution completed for ID %s with framework %s', testID, testFramework);
        res.sendStatus(result.success ? 200 : 500);
        broadcastTests(wss);

        logger.info(`Test results: ${JSON.stringify(result)}`);

        const cleanedData = cleanUp(result);
        const jsonData = JSON.stringify({
            output: cleanedData
        });
        curlTestResults(testID, jsonData);

        if (result.success) {
            logger.info('Test ID %s succeeded', testID);
            curlTestResults(testID, JSON.stringify({
                output: "200:success"
            }));
        } else {
            logger.error('Test ID %s failed', testID);
            curlTestResults(testID, JSON.stringify({
                output: "500:failed"
            }));
        }
    });
};

function curlTestResults(testID, jsonData) {
    const command = `curl -u admin:admin123! -X POST http://localhost:3001/api/tests/store/${testID} -H "Content-Type: application/json" -d ${JSON.stringify(jsonData)}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            logger.error('Curl command failed for test ID %s: %s', testID, error.message);
        } else {
            logger.info('Curl command succeeded for test ID %s: %s', testID, stdout);
        }
    });
}