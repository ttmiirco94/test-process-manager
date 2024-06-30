import React, {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Select, MenuItem, FormControl, InputLabel, Button, TextField, FormControlLabel, Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

// noinspection JSUnusedLocalSymbols
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        color: theme.palette.common.white,
    },
}));

// noinspection JSUnusedLocalSymbols
const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#5e5e5e',
    },
    '&:nth-of-type(even)': {
        backgroundColor: '#505050',
    },
    '& td, & th': {
        border: 0,
    },
}));

const LogViewerV4 = () => {
    const [originalData, setOriginalData] = useState([]);
    const [modifiedData, setModifiedData] = useState([]);
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterMessage, setFilterMessage] = useState('');
    const [logLevels, setLogLevels] = useState([]);
    const [autoUpdate, setAutoUpdate] = useState(false);

    const fetchData = useCallback(async () => {
        resetFilters();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let interval;
        if (autoUpdate) {
            interval = setInterval(fetchData, 5000);
        } else if (!autoUpdate && interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [autoUpdate, fetchData]);

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

    const resetFilters = () => {
        setFilterLevel('all');
        setFilterMessage('');
        setModifiedData(originalData);
    };

    const handleAutoUpdateChange = (event) => {
        setAutoUpdate(event.target.checked);
    };

    return (
        <div>
            <div style={{ padding: 20 }}>
                <div className="filter-section" style={{ marginBottom: 20 }}>
                    <FormControl variant="outlined" style={{ marginRight: 10, minWidth: 200 }}>
                        <InputLabel id="filter-level-label" style={{ color: 'white' }}>Filter Log-Level</InputLabel>
                        <Select
                            labelId="filter-level-label"
                            id="filter-level"
                            value={filterLevel}
                            onChange={handleFilterLevelChange}
                            label="Filter Log-Level"
                            sx={{
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                }
                            }}
                        >
                            {logLevels.map(level => (
                                <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        variant="outlined"
                        placeholder="Enter message to filter"
                        value={filterMessage}
                        onChange={handleFilterMessageChange}
                        style={{ marginRight: 10 }}
                        InputLabelProps={{ style: { color: 'white' } }}
                        inputProps={{ style: { color: 'white' } }}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            }
                        }}
                    />
                    <Button variant="contained" onClick={resetFilters}>
                        Reset Filters
                    </Button>
                    <Button variant="contained" color="secondary" onClick={fetchData} style={{ marginLeft: 10 }}>
                        Update Logs
                    </Button>
                    <FormControlLabel
                        control={<Checkbox checked={autoUpdate} onChange={handleAutoUpdateChange} />}
                        label="Auto Update"
                        style={{ borderColor: 'white',color: 'white', marginLeft: 10 }}
                        sx={{
                            color: 'white',
                            borderColor: 'white',
                            '&.Mui-checked': {
                                color: 'white',
                                borderColor: 'white',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white',
                            }
                        }}
                    />
                </div>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell component="th" scope="head">Timestamp</StyledTableCell>
                                <StyledTableCell component="th" scope="head">Level</StyledTableCell>
                                <StyledTableCell component="th" scope="head">Message</StyledTableCell>
                                <StyledTableCell component="th" scope="head">File</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {modifiedData.map((entry) => (
                                <StyledTableRow key={entry.key}>
                                    <StyledTableCell component="cell" scope="row">{entry.timestamp}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{entry.level}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{entry.message}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{entry.from}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default LogViewerV4;
