import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ReactToPrint from "react-to-print";

export default function LabTabs() {
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab label="Test Control" value="1" />
                        <Tab label="TestData Control" value="2" />
                        <Tab label="Log View" value="3" />
                    </TabList>
                </Box>
                <TabPanel value="1">{Tab1}</TabPanel>
                <TabPanel value="2">{Tab2}</TabPanel>
                <TabPanel value="3">{Tab3}</TabPanel>
            </TabContext>
        </Box>
    );
}

function Tab1() {
    return(
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

function Tab2() {
    return(
        <>
            <div className={`button-group ${isLoading ? 'disabled' : ''}`}>
                <div className="test-actions">
                    <button className="get-test-data-button"
                            onClick={getTestData}
                            disabled={isLoading}>Get Test-Data
                    </button>
                </div>
                <div className="delete-all">
                    <button className="delete-all-button" onClick={deleteAll} disabled={isLoading}>Delete All
                    </button>
                </div>
            </div>
            <div ref={componentRef2} className="test-container">
                {Object.keys(tests).map((testDataID, index) => (
                    <TestDataCard
                        key={testID}
                        testDataID={testID}
                        type={tests[testID].type}
                        testDataOutput={tests[testID].testDataOutput}
                        index={index}
                        deleteTest={deleteTest}
                        isLoading={isLoading}
                    />
                ))}
            </div>
        </>
    )}

function Tab3() {
    return(
        <>
        </>
    )}