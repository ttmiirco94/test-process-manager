// const path = require('path');
// const { execTestAndRespond } = require('../utils/execHelper');
// const { broadcastTests } = require('../utils/websocketHelper');
// const { storeData, retrieveData, writeDataToFile } = require('../utils/fileHelper');
// const logger = require('../config/logger');
// const Test = require('../models/Test');
//
// const baseDir = __dirname;
// const playwrightProjectPath = path.join(baseDir, '..', 'test-frameworks', 'playwright-typescript-poc');
// const mavenProjectPath = path.join(baseDir, '..', 'test-frameworks', 'selenium-quickstarter-master');
// const uftProjectPath = path.join(baseDir, '..', 'test-frameworks', '/path/to/your/uft/project');
//
// let runningTests = {};
// let testDataStorage = {};
//
// exports.runTest = async (testID, type, res, wss) => {
//     let projectPath;
//     let command;
//     switch (type) {
//         case 'selenium':
//             projectPath = mavenProjectPath;
//             command = `mvn -Dtest=${testID} test`;
//             break;
//         case 'playwright':
//             projectPath = playwrightProjectPath;
//             command = `npx playwright test --grep "\\\\b${testID}\\\\b"`;
//             break;
//         case 'uft':
//             projectPath = uftProjectPath;
//             command = `UFT.exe -run -test "{uftProjectPath}\\\\Tests\\\\{testID}" -result "{uftProjectPath}\\\\Results\\\\{testID}"`;
//             break;
//     }
//
//     if (runningTests[testID] && runningTests[testID].type === type) {
//         logger.warn('Test with ID %s is already running. Deleting the existing one.', testID);
//         delete runningTests[testID];
//         broadcastTests(wss);
//         if (testDataStorage.hasOwnProperty(testID)) {
//             delete testDataStorage[testID];
//         }
//     }
//
//     logger.info('Executing test with ID %s using %s framework', testID, type);
//
//     // Save initial test entry
//     //await Test.create({testID, type});
//
//     execTestAndRespond(testID, command, res, projectPath);
// };
//
// exports.getTestResults = (testID, res) => {
//     if (!runningTests[testID]) {
//         logger.error('Test results not found for ID: %s', testID);
//         return res.status(404).json({ error: 'Test ID not found' });
//     }
//     logger.info('Returning test results for ID: %s', testID);
//     res.status(200).json(runningTests[testID]);
// };
//
// exports.storeTestData = (testID, testData, res) => {
//     if (!testData || Object.keys(testData).length === 0) {
//         logger.error('No test data provided for ID: %s', testID);
//         return res.status(400).json({ error: 'No test data provided' });
//     }
//
//     if (!testDataStorage[testID]) {
//         testDataStorage[testID] = [];
//     }
//     testDataStorage[testID] = { data: testData, timestamp: new Date().toISOString() };
//
//     logger.info('Test data stored successfully for ID: %s', testID);
//     res.status(200).json({ message: 'Test data stored successfully' });
// };
//
// exports.retrieveTestData = (testID, res) => {
//     if (!testDataStorage[testID]) {
//         logger.error('Test data not found for ID: %s', testID);
//         return res.status(404).json({ error: 'Test data not found for the given test ID' });
//     }
//
//     logger.info('Returning test data for ID: %s', testID);
//     res.status(200).json(testDataStorage[testID]);
// };
//
// exports.writeTestDataFile = (res) => {
//     logger.info('Writing test data to file');
//     writeDataToFile(testDataStorage, res);
// };
//
// exports.deleteTest = (testID, res, wss) => {
//     if (runningTests[testID]) {
//         logger.info('Deleting test with ID: %s', testID);
//         delete runningTests[testID];
//         broadcastTests(wss);
//         res.sendStatus(200);
//     } else {
//         logger.error('Test not found with ID: %s', testID);
//         res.sendStatus(404);
//     }
// };
//
// exports.deleteAllTests = (res, wss) => {
//     logger.info('Deleting all tests');
//     runningTests = {};
//     broadcastTests(wss);
//     res.sendStatus(200);
// };