import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LogViewerV2 = () => {
    const [originalData, setOriginalData] = useState([]);
    const [modifiedData, setModifiedData] = useState([]);
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterMessage, setFilterMessage] = useState('');
    const [logLevels, setLogLevels] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/logs/v2', {
                    auth: {
                        username: 'admin',
                        password: 'admin123!'
                    }
                });

                const data = response.data;

                if (data && Array.isArray(data.file)) {
                    const modifiedData = data.file.map((entry, index) => ({
                        ...entry,
                        key: index + 1
                    }));

                    const levels = ['all', ...new Set(modifiedData.map(entry => entry.level.toLowerCase()))];

                    setOriginalData(modifiedData);
                    setModifiedData(modifiedData);
                    setLogLevels(levels);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleFilterLevelChange = (event) => {
        const value = event.target.value;
        setFilterLevel(value);
        applyFilters(value, filterMessage);
    };

    const handleFilterMessageChange = (event) => {
        const value = event.target.value;
        setFilterMessage(value);
        applyFilters(filterLevel, value);
    };

    const applyFilters = (level, message) => {
        let filteredData = originalData;

        if (level !== 'all') {
            filteredData = filteredData.filter(entry => entry.level.toLowerCase() === level);
        }

        if (message) {
            filteredData = filteredData.filter(entry =>
                entry.message.toLowerCase().includes(message.toLowerCase()) ||
                entry.from.toLowerCase().includes(message.toLowerCase())
            );
        }

        setModifiedData(filteredData);
    };

    const handleFilterMessageClick = () => {
        applyFilters(filterLevel, filterMessage);
    };

    const resetFilters = () => {
        setFilterLevel('all');
        setFilterMessage('');
        setModifiedData(originalData);
    };

    const getColor = (level) => {
        switch (level) {
            case 'warn':
                return 'orange';
            case 'error':
                return 'red';
            case 'info':
            default:
                return 'white';
        }
    };

    return (
        <div>
            <div className="filter-section">
                <label htmlFor="filter-level">Filter Log-Level:</label>
                <select id="filter-level" value={filterLevel} onChange={handleFilterLevelChange}>
                    {logLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
                <input
                    type="text"
                    value={filterMessage}
                    onChange={handleFilterMessageChange}
                    placeholder="Enter message to filter"
                />
                <button onClick={handleFilterMessageClick}>Filter Message</button>
                <button onClick={resetFilters}>Reset Filters</button>
            </div>
            {modifiedData.map((entry) => (
                <div key={entry.key} className="output-entry" style={{ color: getColor(entry.level) }}>
                    <span className="timestamp">
                        <label>{entry.key}:</label>
                    </span>
                    <span className="message">
                        {`Timestamp: ${entry.timestamp} | From: ${entry.from} | Message: ${entry.message} | Level: ${entry.level}`}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default LogViewerV2;
