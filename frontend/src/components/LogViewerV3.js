import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';

const LogViewerV3 = () => {
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

    const columns = React.useMemo(
        () => [
            {
                Header: 'Log Level',
                accessor: 'level',
            },
            {
                Header: 'From',
                accessor: 'from',
            },
            {
                Header: 'Message',
                accessor: 'message',
            },
        ],
        []
    );

    const data = React.useMemo(() => modifiedData, [modifiedData]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

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
            <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
                <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()} style={{ borderBottom: 'solid 3px red', background: 'aliceblue', color: 'black', fontWeight: 'bold' }}>
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                    <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray', background: 'papayawhip' }}>
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default LogViewerV3;
