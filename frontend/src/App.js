import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import ReactToPrint from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import ReturnSafeTextComponent from './components/ReturnSafeTextComponent'; // Import the component

Modal.setAppElement('#root');

const username = 'admin';
const password = 'admin123!';
const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

const exampleTests = {
    'test1': {
        type: 'selenium',
        output: [
            { timestamp: 1625014800000, message: '200:success - Test completed successfully<br>Next line' },
            { timestamp: 1625014900000, message: 'Info: Checking page elements\nAnother line\r\nYet another line' },
            { timestamp: 1625015000000, message: 'Info: Page loaded correctly' },
        ]
    },
    'test2': {
        type: 'playwright',
        output: [
            { timestamp: 1625015100000, message: '500:failed - Test failed at step 3<br>Failure details' },
            { timestamp: 1625015200000, message: 'Error: Element not found\nAdditional error info' },
        ]
    },
};

function getDateTime(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    return (`${day}.${month}.${year}\r\n${hours}:${minutes}:${seconds}:${milliseconds}`);
}

function formatExampleTests(exampleTests) {
    for (const test of Object.values(exampleTests)) {
        for (const entry of test.output) {
            entry.timestamp = getDateTime(entry.timestamp);
        }
    }
    return exampleTests;
}

const formattedExampleTests = formatExampleTests(exampleTests);

function App() {
    const [tests, setTests] = useState(''); // Set initial state with example data
    const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState('selenium');
    const [testID, setTestID] = useState('');
    const [command, setCommand] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedTestID, setSelectedTestID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const componentRef = useRef();

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3001');
        ws.onmessage = (message) => {
            console.log('Received message: ', message.data);
            const data = JSON.parse(message.data);
            setTests(data);
        };
        ws.onerror = (error) => {
            console.log('Received error:', error.data);
            //setTests(data);
        };
        ws.onopen = (openMessage) => {
            while(isLoading === true) {
                setTimeout(() => null, 100);
            }
            console.log('Received ws.onOpen trigger: ', openMessage.data);
            //setTests(data);
        };
        return () => ws.close();
    }, []);

    const testCommand = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/tests/selenium/TEST123-${Buffer.from(command).toString('base64')}`, {
                method: 'PUT',
                headers: {
                    'Authorization': authHeader,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            } else {
                setIsStartModalOpen(false);
            }
        } catch (error) {
            alert('An error occurred while starting the test. Error: ' + error);
            console.warn(error);
        }
        setTimeout(() => setIsLoading(false), 5000);
    };

    const startTest = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/tests/${selectedEndpoint}/${testID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': authHeader,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            } else {
                setIsStartModalOpen(false);
                setTestID('');
            }
        } catch (error) {
            alert('An error occurred while starting the test.');
        }
        setTimeout(() => setIsLoading(false), 5000);
    };

    const sendOutput = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/test-output/${selectedTestID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                },
                body: JSON.stringify({ output: outputText }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            } else {
                setIsOutputModalOpen(false);
                setOutputText('');
            }
        } catch (error) {
            alert('An error occurred while sending the output.');
        }
        setTimeout(() => setIsLoading(false), 5000);
    };

    const deleteTest = async (testID) => {
        setIsLoading(true);
        const response = await fetch(`http://localhost:3001/api/tests/${testID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader,
            },
        });
        if (response.ok) {
            setTests(prevTests => {
                const newTests = { ...prevTests };
                delete newTests[testID];
                return newTests;
            });
        } else {
            alert('Error deleting the test.');
        }
        setTimeout(() => setIsLoading(false), 5000);
    };

    const deleteAllTests = async () => {
        if (window.confirm('Do you really want to delete all listed tests?')) {
            setIsLoading(true);
            const response = await fetch('http://localhost:3001/api/tests', {
                method: 'DELETE',
                headers: {
                    'Authorization': authHeader,
                },
            });
            if (response.ok) {
                setTests({});
            } else {
                alert('Error deleting all tests.');
            }
            setTimeout(() => setIsLoading(false), 3000);
        }
    };

    const deleteAll = async () => {
        await deleteAllTests();
        setTests({});
    };

    return (
        <div className="App">
            <header className="header">
                <img src="../public/Logo_fixed.png" alt="Logo" className="logo"/>
            </header>
            <header className="header">
                <h2>aityPilot - TestFlowManager</h2>
                <h3>by Mirco Recknagel</h3>
            </header>
            {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="loading-icon"/>}
            <div className={`button-group ${isLoading ? 'disabled' : ''}`}>
                <div className="test-actions">
                    <button className="test-command-button" onClick={() => !isLoading && setIsCommandModalOpen(true)}
                            disabled={isLoading}>Test Command
                    </button>
                    <button className="start-test-button" onClick={() => !isLoading && setIsStartModalOpen(true)}
                            disabled={isLoading}>Start Test
                    </button>
                    <button className="send-output-button" onClick={() => !isLoading && setIsOutputModalOpen(true)}
                            disabled={isLoading}>Send Output
                    </button>
                </div>
                <div className="print-report">
                    <ReactToPrint
                        trigger={() => <button className="print-button" disabled={isLoading}>Print Report</button>}
                        content={() => componentRef.current}
                    />
                </div>
                <div className="delete-all">
                    <button className="delete-all-button" onClick={deleteAll} disabled={isLoading}>Delete All</button>
                </div>
            </div>
            <div ref={componentRef} className="test-container">
                {Object.keys(tests).map((testID, index) => (
                    <TestCard
                        key={testID}
                        testID={testID}
                        type={tests[testID].type}
                        output={tests[testID].output}
                        index={index}
                        deleteTest={deleteTest}
                        isLoading={isLoading}
                    />
                ))}
            </div>

            <Modal isOpen={isCommandModalOpen} onRequestClose={() => setIsCommandModalOpen(false)} className="modal"
                   overlayClassName="overlay">
                <h2>Test Command</h2>
                {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="loading-icon"/>}
                <div>
                    <label>TestID: TEST123</label>
                    <label type="text" value="TEST123" onChange={(e) => setTestID(e.target.value)}
                           disabled={isLoading}/>
                </div>
                <div>
                    <label>CMD Prompt:</label>
                    <input type="text" value={command} onChange={(e) => setCommand(e.target.value)}
                           disabled={isLoading}/>
                </div>
                <button onClick={testCommand} disabled={isLoading}>Send Request</button>
                <button onClick={() => setIsCommandModalOpen(false)} disabled={isLoading}>Close</button>
            </Modal>

            <Modal isOpen={isStartModalOpen} onRequestClose={() => setIsStartModalOpen(false)} className="modal"
                   overlayClassName="overlay">
                <h2>Start Test</h2>
                {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="loading-icon"/>}
                <div>
                    <label>Endpoint:</label>
                    <select value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)}
                            disabled={isLoading}>
                        <option value="selenium">Selenium</option>
                        <option value="playwright">Playwright</option>
                        <option value="uft">UFT</option>
                    </select>
                </div>
                <div>
                    <label>Test ID:</label>
                    <input type="text" value={testID} onChange={(e) => setTestID(e.target.value)} disabled={isLoading}/>
                </div>
                <button onClick={startTest} disabled={isLoading}>Send Request</button>
                <button onClick={() => setIsStartModalOpen(false)} disabled={isLoading}>Close</button>
            </Modal>

            <Modal isOpen={isOutputModalOpen} onRequestClose={() => setIsOutputModalOpen(false)} className="modal"
                   overlayClassName="overlay">
                <h2>Send Output</h2>
                {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="loading-icon"/>}
                <div>
                    <label>Test ID:</label>
                    <select value={selectedTestID} onChange={(e) => setSelectedTestID(e.target.value)}
                            disabled={isLoading}>
                        {Object.keys(tests).map(testID => (
                            <option key={testID} value={testID}>{testID}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Output:</label>
                    <textarea value={outputText} onChange={(e) => setOutputText(e.target.value)} disabled={isLoading}/>
                </div>
                <button onClick={sendOutput} disabled={isLoading}>Send Output</button>
                <button onClick={() => setIsOutputModalOpen(false)} disabled={isLoading}>Close</button>
            </Modal>
        </div>
    );
}

function TestCard({testID, type, output, index, deleteTest, isLoading}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const cardClass = index % 2 === 0 ? 'test-card darker' : 'test-card lighter';
    const lastStatus = output.map(o => o.message).reverse().find(message => message.includes("500:failed") || message.includes("200:success"));
    const status = lastStatus?.includes("500:failed") ? 'failed' : lastStatus?.includes("200:success") ? 'success' : null;

    return (
        <div className={cardClass}>
            <h3>{`Test (${testID}) - ${type.toUpperCase()} Endpoint`}</h3>
            <button onClick={() => !isLoading && deleteTest(testID)} className="delete-button" disabled={isLoading}>Delete</button>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-button" disabled={isLoading}>
                {isCollapsed ? 'Expand' : 'Collapse'}
            </button>
            {status && (
                <span className={`status-icon ${status}`}>
                    {status === 'success' ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
                </span>
            )}
            {!isCollapsed && (
                <div className="output">
                    {output.map((entry, i) => (
                        <div key={i} className="output-entry">
                            <span className="timestamp">{entry.timestamp}:</span> <ReturnSafeTextComponent text={entry.message}/>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
