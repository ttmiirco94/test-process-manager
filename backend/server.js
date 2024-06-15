const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment-timezone');
const basicAuth = require('express-basic-auth');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.json());

// Setup basic auth
app.use(basicAuth({
    users: { 'admin': 'admin123!' },
    challenge: true,
    unauthorizedResponse: (req) => 'Unauthorized'
}));

// Path to your test automation project directories
const mavenProjectPath = 'C:\\Users\\mirco\\Desktop\\test-process-manager\\test-frameworks\\selenium-quickstarter-master';
const uftProjectPath = '/path/to/your/uft/project';
const playwrightProjectPath = 'C:\\Users\\mirco\\Desktop\\test-process-manager\\test-frameworks\\playwright-typescript-poc';

let runningTests = {};
let latestTestResults = {};

function execTestAndRespondOld(testID, command, res, projectPath) {
    exec(command, { cwd: projectPath , stdio: 'pipe' }, (error, stdout, stderr) => {
        let result = {
            success: !error && !stderr,
            output: error ? error.message : (stderr ? stderr : stdout),
            timestamp: new Date().toISOString()
        };
        latestTestResults = result;
        console.info(result);
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
                console.warn('Could not detect framework from projectPath. This does not mean the execution will fail. Its just needed for the WebApp.');
        }
        runningTests[testID] = { type: testFramework, output: [] };

        broadcastTests();

        // Respond with the result
        res.sendStatus(result.success ? 200 : 500);

        // Clean up result text and provide data for curlTestResults()
        const cleanedData = cleanUp(result);
        const jsonData = JSON.stringify({
            output: cleanedData
        });
        // Post result text to WebApp
        curlTestResults(testID, jsonData);

        // Mark test as successful or failed in WebApp
        if(result.success === true) {
            curlTestResults(testID, JSON.stringify({
                output: "200:success"
            }));
        } else if(result.success === false) {
            curlTestResults(testID, JSON.stringify({
                output: "500:failed"
            }));
        }
    });
}

function execTestAndRespond(testID, command, res, projectPath) {
    let result = {
        success: null,
        output: null,
        timestamp: new Date().toISOString()
    };
    let combinedOutput = '';

    const child = exec(command, { cwd: projectPath});

    child.stdout.on('data', (data) => {
        combinedOutput += data;
    });

    child.stderr.on('data', (data) => {
        combinedOutput += data;
    });

    child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        result.output = combinedOutput.trim();
        console.log(result.output);
        if(code === 0) {
            result.success = true;
        } else if(code !== 0) {
            result.success = false;
        }
        latestTestResults = result;

        console.info(result);
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
                console.warn('Could not detect framework from projectPath. This does not mean the execution will fail. Its just needed for the WebApp.');
        }
        runningTests[testID] = { type: testFramework, output: [] };

        broadcastTests();

        // Respond with the result
        res.sendStatus(result.success ? 200 : 500);

        // Clean up result text and provide data for curlTestResults()
        const cleanedData = cleanUp(result);
        const jsonData = JSON.stringify({
            output: cleanedData
        });
        // Post result text to WebApp
        curlTestResults(testID, jsonData);

        // Mark test as successful or failed in WebApp
        if(result.success === true) {
            curlTestResults(testID, JSON.stringify({
                output: "200:success"
            }));
        } else if(result.success === false) {
            curlTestResults(testID, JSON.stringify({
                output: "500:failed"
            }));
        }

    });
}

function curlTestResults(testID, jsonData) {
    const command = `curl -u admin:admin123! -X POST http://localhost:3001/test-output/${testID} -H "Content-Type: application/json" -d ${JSON.stringify(jsonData)}`;
    exec(command, (error, stdout, stderr) => {
        let result = {
            success: true,
            output: stdout,
            timestamp: new Date().toISOString()
        };
        console.info('Curl Result: ' + result.success + ' , Output: ' + result.output + ' , Timestamp: ' + result.timestamp);
    });
}

function cleanUp(data) {
      // Trim leading and trailing spaces
    return data.output
        .replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]/g, '')  // Remove ANSI escape codes
        .replace(/[›@\\/:.<>\|]/g, '')  // Remove unwanted characters including ":", "<", ">", "|"
        .replace(/["']/g, '')  // Remove quotes
        .replace(/(\r\n|\n|\r)/gm, ' ')  // Replace newlines with space
        .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
        .trim();  // Trim leading and trailing spaces
}

function waitForVariable(variableName, maxWaitingTime = 300000) {
    return new Promise((resolve, reject) => {
        let interval;
        let startTime = Date.now();

        interval = setInterval(() => {
            if (typeof window[variableName] !== 'undefined') {
                clearInterval(interval);
                resolve(window[variableName]);
            } else if (Date.now() - startTime >= maxWaitingTime) {
                clearInterval(interval);
                reject(new Error(`Variable ${variableName} was not defined within ${maxWaitingTime / 60000} minutes.`));
            }
        }, 100); // Check every 100 milliseconds
    });
}

app.put('/selenium-test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        return res.status(400).json({ error: 'Test ID already exists' });
    }
    //mvn -Dtest={testID} test
    //mvn -Dtest=TST-321#testMethod test
    execTestAndRespond(testID, `mvn -Dtest=${testID} test`, res, mavenProjectPath);
});

app.put('/playwright-test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        return res.status(400).json({ error: 'Test ID already exists' });
    }
    execTestAndRespond(testID, `npx playwright test --grep "\\b${testID}\\b"`, res, playwrightProjectPath);
});

app.put('/uft-test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        return res.status(400).json({ error: 'Test ID already exists' });
    }
    execTestAndRespond(testID, `UFT.exe -run -test "${uftProjectPath}\\Tests\\${testID}" -result "${uftProjectPath}\\Results\\${testID}"`, res, uftProjectPath);
});

app.post('/test-output/:testID', (req, res) => {
    const testID = req.params.testID;
    const output = req.body.output;
    const timestamp = moment().tz('Europe/Berlin').format('YYYY-MM-DD HH:mm:ss');
    if (!runningTests[testID]) {
        return res.status(404).json({ error: 'Test ID not found' });
    }
    runningTests[testID].output.push({ message: output, timestamp });
    broadcastTests();
    res.sendStatus(200);
});

app.delete('/test/:testID', (req, res) => {
    const testID = req.params.testID;
    if (runningTests[testID]) {
        delete runningTests[testID];
        broadcastTests();
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.delete('/tests', (req, res) => {
    runningTests = {};
    broadcastTests();
    res.sendStatus(200);
});

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(runningTests));
});

function broadcastTests() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(runningTests));
        }
    });
}

server.listen(3001, () => {
    console.log('Server is listening on port 3001');
});
