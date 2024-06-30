import React, {useEffect, useState, useRef} from 'react';
import './App.css';
import ReactToPrint from 'react-to-print';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faTimesCircle, faSpinner} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import ReturnSafeTextComponent from './components/ReturnSafeTextComponent'; // Import the component
import ReturnSafeLogoComponent from "./components/ReturnSafeLogoComponent";
import LogViewerV4 from "./components/LogViewerV4";
import DataStoreViewer from "./components/DataStoreViewer";

Modal.setAppElement('#root');

const username = 'admin';
const password = 'admin123!';
const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

function formatDate(isoString) {
    const date = new Date(isoString);
    const pad = (number) => number.toString().padStart(2, '0');
    const day = pad(date.getUTCDate());
    const month = pad(date.getUTCMonth() + 1); // Months are zero-indexed
    const year = date.getUTCFullYear();
    const hours = pad(date.getUTCHours() + 2);
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

function App() {
    const [tests, setTests] = useState(''); // Set initial state with example data
    const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isGetDataModalOpen, setIsGetDataModalOpen] = useState(false);
    const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState('selenium');
    const [testID, setTestID] = useState('');
    const [testDataID, setTestDataID] = useState('');
    const [cmdPrompt, setCmdPrompt] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedTestID, setSelectedTestID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Test Output'); // State for active tab
    const componentRef = useRef();
    const componentRef2 = useRef();

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
            setTimeout(() => null, 100);
            console.log('Received ws.onOpen trigger: ', openMessage.data);
            //setTests(data);
        };
        return () => ws.close();
    }, []);
    const logCommand = async () => {
        await console.log(`testID: ${testID}, Command: ${cmdPrompt}, base64: ${btoa(cmdPrompt)}`);
    }
    const testCommand = async () => {
        setIsLoading(true);
        try {
            await console.log(`testID: ${testID}, Command: ${cmdPrompt}, base64: ${btoa(cmdPrompt)}`);
            const response = await fetch(`http://localhost:3001/api/tests/selenium/TEST123-${btoa(cmdPrompt)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': authHeader,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            } else {
                setIsCommandModalOpen(false);
            }
        } catch (error) {
            alert('An error occurred while sending the Command to execute. Error: ' + error);
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

    const getTestData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/tests/results/${testDataID}`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            } else {
                setIsGetDataModalOpen(false);
                setTestDataID('');
            }
        } catch (error) {
            alert('An error occurred while getting test-data.');
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
                body: JSON.stringify({output: outputText}),
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
                const newTests = {...prevTests};
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
            <header className="headerLogo">
                <ReturnSafeLogoComponent/>
            </header>
            <header className="header">
                <h2>aityPilot - TestFlowManager</h2>
                <label className="sub-header">by Mirco Recknagel</label>
            </header>
            {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="loading-icon"/>}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'Test Output' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Test Output')}
                >
                    Test Results
                </button>
                <button
                    className={`tab ${activeTab === 'DataStore-Viewer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('DataStore-Viewer')}
                >
                    DataStore Viewer
                </button>
                <button
                    className={`tab ${activeTab === 'Log-Viewer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Log-Viewer')}
                >
                    Log Viewer
                </button>
            </div>
            {activeTab === 'Test Output' && (
                <>
                    <div className={`button-group ${isLoading ? 'disabled' : ''}`}>
                        <div className="test-actions">
                            <button className="test-command-button"
                                    onClick={() => !isLoading && setIsCommandModalOpen(true)}
                                    disabled={isLoading}>Test Command
                            </button>
                            <button className="start-test-button"
                                    onClick={() => !isLoading && setIsStartModalOpen(true)}
                                    disabled={isLoading}>Start Test
                            </button>
                            <button className="send-output-button"
                                    onClick={() => !isLoading && setIsOutputModalOpen(true)}
                                    disabled={isLoading}>Send Output
                            </button>
                        </div>
                        <div className="print-report">
                            <ReactToPrint
                                trigger={() => <button className="print-button" disabled={isLoading}>Print
                                    Report</button>}
                                content={() => componentRef.current}
                            />
                        </div>
                        <div className="delete-all">
                            <button className="delete-all-button" onClick={deleteAll} disabled={isLoading}>Delete All
                            </button>
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
                </>
            )}
            {activeTab === 'DataStore-Viewer' && (
                <>
                    {/*<div className={`button-group ${isLoading ? 'disabled' : ''}`}>*/}
                    {/*    <div className="test-actions">*/}
                    {/*        <button className="get-test-data-button"*/}
                    {/*                onClick={getTestData}*/}
                    {/*                disabled={isLoading}>Get Test-Data*/}
                    {/*        </button>*/}
                    {/*    </div>*/}
                    {/*    <div className="delete-all">*/}
                    {/*        <button className="delete-all-button" onClick={deleteAll} disabled={isLoading}>Delete All*/}
                    {/*        </button>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="test-container">
                        <h1>DataStore Viewer</h1>
                        <DataStoreViewer/>
                    </div>
                    {/*<div ref={componentRef2} className="test-container">*/}
                    {/*    {Object.keys(tests).map((testDataID, index) => (*/}
                    {/*        <TestDataCard*/}
                    {/*            // key={testID}*/}
                    {/*            // testDataID={testID}*/}
                    {/*            // type={tests[testID].type}*/}
                    {/*            // testDataOutput={tests[testID].testDataOutput}*/}
                    {/*            // index={index}*/}
                    {/*            // deleteTest={deleteTest}*/}
                    {/*            // isLoading={isLoading}*/}
                    {/*        />*/}
                    {/*    ))}*/}
                    {/*</div>*/}
                </>
            )}
            {activeTab === 'Log-Viewer' && (
                <>
                    <div className="test-container">
                        <h1>Server Log Viewer</h1>
                        <LogViewerV4/>
                    </div>
                </>
            )}

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
                    <input type="text" value={cmdPrompt} onChange={(e) => setCmdPrompt(e.target.value)}
                           disabled={isLoading}/>
                </div>
                <button onClick={logCommand} disabled={isLoading}>Log Values</button>
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
                            <span className="timestamp">{formatDate(entry.timestamp)}</span> <ReturnSafeTextComponent text={entry.message} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TestDataCard({testDataID, type, testDataOutput, index, deleteTest, isLoading}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const cardClass = index % 2 === 0 ? 'test-card darker' : 'test-card lighter';

    return (
        <>
        </>
        // <div className={cardClass}>
        //     <h3>{`Test (${testDataID}) - ${type.toUpperCase()} Endpoint`}</h3>
        //     <button onClick={() => !isLoading && deleteTest(testDataID)} className="delete-button" disabled={isLoading}>Delete</button>
        //     <button onClick={() => setIsCollapsed(!isCollapsed)} className="toggle-button" disabled={isLoading}>
        //         {isCollapsed ? 'Expand' : 'Collapse'}
        //     </button>
        //     {!isCollapsed && (
        //         <div className="output">
        //             {testDataOutput.map((entry, i) => (
        //                 <div key={i} className="output-entry">
        //                     <span className="timestamp">{formatDate(entry.timestamp)}</span> <ReturnSafeTextComponent text={entry.message} />
        //                 </div>
        //             ))}
        //         </div>
        //     )}
        // </div>
    );
}

export default App;
