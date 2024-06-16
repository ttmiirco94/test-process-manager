# Test Process Manager
## Auto-generated Documentation (currently not up-to-date)

## Overview

Test Process Manager is a full-stack application designed to control and start UI tests through a WebSocket-enabled API. The project consists of two main components: the backend API and the frontend UI.

## Project Structure

- **backend**: Contains the Node.js server with WebSocket support.
- **frontend**: Contains the React application for the UI.

## Installation

### Prerequisites

- Node.js (version 14.x or later)
- npm (version 6.x or later)

### Backend Setup

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the frontend development server:
    ```bash
    npm start
    ```

## Usage

### Starting the Servers

- **Backend**: The backend server will start at `http://localhost:3000` by default.
- **Frontend**: The frontend development server will start at `http://localhost:3000` by default.

### Interacting with the Application

1. Ensure both the backend and frontend servers are running.
2. Open your browser and navigate to `http://localhost:3000`.
3. Use the UI to control and start your tests.

### Example Usage

#### Starting a Test

1. Open the application in your browser.
2. Navigate to the "Start Test" section.
3. Select the test you want to run from the dropdown menu.
4. Click the "Start" button.
5. Monitor the test progress and results in the provided UI.

#### Monitoring Test Status

1. Navigate to the "Test Status" section.
2. View the status of currently running tests, including progress and any errors.
3. Use the refresh button to update the status in real-time.

#### Viewing Test Results

1. Navigate to the "Test Results" section.
2. Select a completed test from the list.
3. View detailed results, including success/failure status and logs.

### Example API Requests

#### Starting a Test

```bash
curl -X POST http://localhost:3000/start-test \
-H "Content-Type: application/json" \
-d '{
  "testName": "SampleTest",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}'
