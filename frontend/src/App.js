import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import ReactToPrint from 'react-to-print';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const username = 'admin';
const password = 'admin123!';
const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

function App() {
    const [tests, setTests] = useState({});
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState('selenium-test');
    const [testID, setTestID] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedTestID, setSelectedTestID] = useState('');
    const componentRef = useRef();

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3001');
        ws.onmessage = (message) => {
            const data = JSON.parse(message.data);
            setTests(data);
        };
        return () => ws.close();
    }, []);

    const startTest = async () => {
        try {
            const response = await fetch(`http://localhost:3001/${selectedEndpoint}/${testID}`, {
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
    };

    const sendOutput = async () => {
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
    };

    const deleteTest = async (testID) => {
        const response = await fetch(`http://localhost:3001/test/${testID}`, {
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
    };

    const deleteAllTests = async () => {
        if (window.confirm('Do you really want to delete all listed tests?')) {
            const response = await fetch('http://localhost:3001/tests', {
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
        }
    };

    return (
        <div className="App">
            <header className="header">
                <img src="/logo1.png" alt="Logo 1" className="logo" />
                <img src="/logo2.png" alt="Logo 2" className="logo" />
                <h1>Mirco Test-Process-Manager</h1>
            </header>
            <div className="button-group">
                <div className="test-actions">
                    <button className="start-test-button" onClick={() => setIsStartModalOpen(true)}>Start Test</button>
                    <button className="send-output-button" onClick={() => setIsOutputModalOpen(true)}>Send Output</button>
                </div>
                <div className="print-report">
                    <ReactToPrint
                        trigger={() => <button className="print-button">Print Report</button>}
                        content={() => componentRef.current}
                    />
                </div>
                <div className="delete-all">
                    <button className="delete-all-button" onClick={deleteAllTests}>Delete All</button>
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
                    />
                ))}
            </div>

            <Modal isOpen={isStartModalOpen} onRequestClose={() => setIsStartModalOpen(false)} className="modal" overlayClassName="overlay">
                <h2>Start Test</h2>
                <div>
                    <label>Endpoint:</label>
                    <select value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)}>
                        <option value="selenium-test">Selenium</option>
                        <option value="playwright-test">Playwright</option>
                        <option value="uft-test">UFT</option>
                    </select>
                </div>
                <div>
                    <label>Test ID:</label>
                    <input type="text" value={testID} onChange={(e) => setTestID(e.target.value)} />
                </div>
                <button onClick={startTest}>Send Request</button>
                <button onClick={() => setIsStartModalOpen(false)}>Close</button>
            </Modal>

            <Modal isOpen={isOutputModalOpen} onRequestClose={() => setIsOutputModalOpen(false)} className="modal" overlayClassName="overlay">
                <h2>Send Output</h2>
                <div>
                    <label>Test ID:</label>
                    <select value={selectedTestID} onChange={(e) => setSelectedTestID(e.target.value)}>
                        {Object.keys(tests).map(testID => (
                            <option key={testID} value={testID}>{testID}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Output:</label>
                    <textarea value={outputText} onChange={(e) => setOutputText(e.target.value)} />
                </div>
                <button onClick={sendOutput}>Send Output</button>
                <button onClick={() => setIsOutputModalOpen(false)}>Close</button>
            </Modal>
        </div>
    );
}

function TestCard({ testID, type, output, index, deleteTest }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const cardClass = index % 2 === 0 ? 'test-card darker' : 'test-card lighter';
    const lastStatus = output.map(o => o.message).reverse().find(message => message.includes("500:failed") || message.includes("200:success"));
    const status = lastStatus?.includes("500:failed") ? 'failed' : lastStatus?.includes("200:success") ? 'success' : null;

    return (
        <div className={cardClass}>
            <h3>{`Test (${testID}) - ${type.toUpperCase()} Endpoint`}</h3>
            <button onClick={() => deleteTest(testID)} className="delete-button">Delete</button>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-button">
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
                            <span className="timestamp">{entry.timestamp}:</span> {entry.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
