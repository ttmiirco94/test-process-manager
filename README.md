<p align="center">
  <img src="\public\media\logos\Logo.png" alt="aityPilot" width="400" />
</p>

<h1 align="center" style="line-height:0%">aityPILOT</h1>
<h1 align="center" style="line-height:0%">TestFlowManager</h1>
<p align="center">
  <a href="https://stackshare.io/[CreateAccountPutLinkHere]">
    <img src="https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat" alt="StackShare" />
  </a>
</p>
<p align="center">
  <b>TestFlowManager is a full-stack application designed to control, start and share tests & test data between different TestAutomation Frameworks through a WebSocket-enabled API.</b></br>
  <span>The project consists of three components: an Express Server/API, a React Frontend and a SQLite3 database.</span></br>
  <sub>by <a href="https://github.com/ttmiirco94">ttmiirco94</a></sub>
</p>
<br/>

## Overview

TestFlowManager is a full-stack application designed to control, start and share tests & test data between different TestAutomation Frameworks through a WebSocket-enabled API. The project consists of three components: an Express Server/API, a React Frontend and a SQLite3 database.

# Documentation currently outdated due to frequently pushed changes & improvements

### Endpoint Diagram
![Alt text](\public\media\api_overview.png "API Overview")

### Sequence Example
![Alt text](\public\media\sequence_diagram.png "API Overview")

### Why? What for?

>To execute real prod-environment use-cases inside a company, real "End-2-End" tests, often requires interaction with multiple products/software from this company.

>Another real world problem is that a company with multiple products/software often gathered the same amount of test automation projects. These projects evolved over the time. While some Selenium projects run on Java JDK 1.8 other projects might be newer or even use Playwright instead of Selenium. Sometimes your newly test requires some pre-conditions that involves those older products. Since you already have automated tests there the Test-Process-Manager allows you to quickly connect your new test to the old one or vice versa.

Example: Perform WebUI Payment Transaction from Bank Account - Use Case (Playwright/Selenium)

- requires some manual task or interaction with a Desktop Application depending on the test environment setup or due to company related processes - e.g. finance companies often require verifications/triggers to start a specific process/payment transaction or other things
- in my case often involves interaction with Windows Applications
  1. although we have UFT tests, connecting these two and sharing test-data that was just created was the problem
- the Test-Process-Manager allows us to start a UFT test inside a Playwright/Selenium test and provides easy access to test-data for each project
- this way I can fully automate this specific End-2-End use case

---

## Project Structure

- **backend**: Contains the Node.js server with WebSocket support.
- **frontend**: Contains the React application for the UI.
- **test-frameworks**: Contains for __demo and test purposes__ a example Selenium and Playwright project
---
## Installation

### Prerequisites

- Node.js (version 14.x or later)
- npm (version 6.x or later)

### Setup

Scripts can be found in package.json

1. Install all Dependencies, using the script from package.json
    ```bash
    npm run install:backend:frontend:test-frameworks
    ```

2. Start the Frontend & Back:
    ```bash
    npm run start:all
    ```

3. Browser should automatically open with the Frontend-UI, otherwise look at the Terminal output to see the URL's
---
## How To Access/Interact

### Accessing the Servers

- **Backend**: The backend server will start at `http://localhost:3001` by default.
- **Frontend**: The frontend development server will start at `http://localhost:3000` by default.

### Interacting with the Application

1. Frontend
   1. Open the WebUI, where you can
      2. Start tests
      3. Delete tests (delete = stored information inside the API)
      4. See Terminal Outputs for better debug information (currently the Terminal Outputs are very bad formatted and include multiple `String.replaces()` to make it work)
2. API Requests
   1. Read API documentation and send requests to use Test-Process-Manager 
3. Test-Automation-Frameworks
   1. Integrate the Test-Process-Manager into your test automation projects to control and run tests outside this project 
---
## Example API Usage

### PUT /selenium-test/

Runs a Selenium test with the specified test ID.
- URL: /selenium-test/:testID
- Method: PUT
- Auth Required: Yes
- URL Params:
  - testID=[string]
- Success Response:
  - Code: 200
- Error Response:
  - Code: 500

Example cURL:
```bash
curl -u admin:admin123! -X PUT http://localhost:3001/selenium-test/TEST123
```

### PUT /playwright-test/

Runs a Playwright test with the specified test ID.
- URL: /playwright-test/:testID
- Method: PUT
- Auth Required: Yes
- URL Params:
   - testID=[string]
- Success Response:
   - Code: 200
- Error Response:
   - Code: 500

Example cURL:
```bash
curl -u admin:admin123! -X PUT http://localhost:3001/playwright-test/TEST123
```

### PUT /uft-test/

Runs a UFT test with the specified test ID.
- URL: /uft-test/:testID
- Method: PUT
- Auth Required: Yes
- URL Params:
   - testID=[string]
- Success Response:
   - Code: 200
- Error Response:
   - Code: 500

Example cURL:
```bash
curl -u admin:admin123! -X PUT http://localhost:3001/uft-test/TEST123
```

### POST /store-test-data/

Stores test data for the specified test ID.
- URL: /store-test-data/:testID
- Method: POST
- Auth Required: Yes
- URL Params:
   - testID=[string]
- Data params:
   - { "data": [object] }
- Success Response:
   - Code: 200
   - Content: { "message": "Test data stored successfully" }
- Error Response:
   - Code: 500

Example cURL:
```bash
curl -u admin:admin123! -X POST http://localhost:3001/store-test-data/TEST123 -H "Content-Type: application/json" -d '{"key1":"value1","key2":"value2"}'
```

### GET /retrieve-test-data/

Retrieves stored test data for the specified test ID.
- URL: /playwright-test/:testID
- Method: PUT
- Auth Required: Yes
- URL Params:
   - testID=[string]
- Success Response:
   - Code: 200
   - Content: { "data": [object], "timestamp": [string] }
- Error Response:
   - Code: 500

Example cURL:
```bash
curl -u admin:admin123! -X PUT http://localhost:3001/playwright-test/TEST123
```
### Other Endpoints (may get removed in the future)
#### POST /test-output/
Posts test output for the specified test ID.

#### GET /test-results/
Gets the test results for the specified test ID.

#### POST /write-test-data-file
Writes all stored test data to a file.

#### DELETE /test/
Deletes the test data for the specified test ID.

#### DELETE /tests
Deletes all test data.

---
## Example Demo
This example uses the two included test-frameworks.

This requests will start a Playwright test. Inside the Playwright test a API request starts a Selenium test which saves specific test-data. 

After the Selenium test execution the Playwright test continues and retrieves the stored test-data.

```bash
curl -u admin:admin123! -X PUT http://localhost:3001/playwright-test/SeleniumPlusPlaywright
```