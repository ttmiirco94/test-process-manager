import React, {useEffect, useState, useRef} from 'react';
import './App.css';
import ReactToPrint from 'react-to-print';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSpinner} from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import TestCard from './components/TestCard';
import ReturnSafeLogoComponent from './components/ReturnSafeLogoComponent';
import LogViewerV4 from './components/LogViewerV4';
import DataStoreViewer from './components/DataStoreViewer';

Modal.setAppElement('#root');

const username = 'admin';
const password = 'admin123!';
const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

function App() {
    const [tests, setTests] = useState(''); // Set initial state with example data
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [selectedEndpoint, setSelectedEndpoint] = useState('selenium');
    const [testID, setTestID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Test Controller'); // State for active tab
    const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
    const [queueCount, setQueueCount] = useState(1);
    const [queueTests, setQueueTests] = useState([{ framework: 'selenium', testID: '' }]);
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
            setTimeout(() => null, 100);
            console.log('Received ws.onOpen trigger: ', openMessage.data);
            //setTests(data);
        };
        return () => ws.close();
    }, []);

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

    const openQueueModal = () => {
        setIsQueueModalOpen(true);
    };

    const closeQueueModal = () => {
        setIsQueueModalOpen(false);
        setQueueCount(1);
        setQueueTests([{ framework: 'selenium', testID: '' }]);
    };

    const handleQueueCountChange = (e) => {
        const newCount = parseInt(e.target.value);
        setQueueCount(newCount);
        setQueueTests(prevTests => {
            if (newCount > prevTests.length) {
                return [...prevTests, ...Array(newCount - prevTests.length).fill().map(() => ({ framework: 'selenium', testID: '' }))];
            } else {
                return prevTests.slice(0, newCount);
            }
        });
    };

    const handleQueueTestChange = (index, field, value) => {
        setQueueTests(prevTests => {
            const newTests = [...prevTests];
            newTests[index] = { ...newTests[index], [field]: value };
            return newTests;
        });
    };

    const startQueueTests = async () => {
        setIsLoading(true);
        for (const test of queueTests) {
            try {
                const response = await fetch(`http://localhost:3001/api/tests/${test.framework}/${test.testID}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': authHeader,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Error starting test ${test.testID}: ${errorData.error}`);
                    break;
                }
            } catch (error) {
                alert(`An error occurred while starting test ${test.testID}.`);
                break;
            }
        }
        setIsLoading(false);
        closeQueueModal();
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
                    className={`tab ${activeTab === 'Test Controller' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Test Controller')}
                >
                    Test Controller
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
            {activeTab === 'Test Controller' && (
                <>
                    <div className={`button-group ${isLoading ? 'disabled' : ''}`}>
                        <div className="test-actions">
                            <button className="start-test-button"
                                    onClick={() => !isLoading && setIsStartModalOpen(true)}
                                    disabled={isLoading}>Start Test
                            </button>
                            <button className="queue-test-button" onClick={() => !isLoading && openQueueModal()}
                                    disabled={isLoading}>
                                Queue Test
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
                    <div className="test-container">
                        <h1>DataStore Viewer</h1>
                        <DataStoreViewer/>
                    </div>
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

            {/*Start Test Dialog*/}
            <Modal isOpen={isStartModalOpen} onRequestClose={() => setIsStartModalOpen(false)} className="modal" overlayClassName="overlay">
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

            {/*Queue Tests Dialog*/}
            <Modal isOpen={isQueueModalOpen} onRequestClose={closeQueueModal} className="modal" overlayClassName="overlay">
            <h2>Queue Tests</h2>
            {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="loading-icon"/>}
            <div>
                <label>Number of tests to queue:</label>
                <input
                    type="number"
                    min="1"
                    value={queueCount}
                    onChange={handleQueueCountChange}
                    disabled={isLoading}
                />
            </div>
            {queueTests.map((test, index) => (
                <div key={index}>
                    <h3>Test {index + 1}</h3>
                    <div>
                        <label>Framework:</label>
                        <select
                            value={test.framework}
                            onChange={(e) => handleQueueTestChange(index, 'framework', e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="selenium">Selenium</option>
                            <option value="playwright">Playwright</option>
                            <option value="uft">UFT</option>
                        </select>
                    </div>
                    <div>
                        <label>Test ID:</label>
                        <input
                            type="text"
                            value={test.testID}
                            onChange={(e) => handleQueueTestChange(index, 'testID', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>
            ))}
            <button onClick={startQueueTests} disabled={isLoading}>Start Queue</button>
            <button onClick={closeQueueModal} disabled={isLoading}>Close</button>
        </Modal>

        </div>
    );
}

export default App;
