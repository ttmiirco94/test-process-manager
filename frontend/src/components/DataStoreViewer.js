import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Select, MenuItem, FormControl, InputLabel, Button, TextField, FormControlLabel, Checkbox, TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';

const dateUtils = require('../utils/date-utils');

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
const StyledTableRow = styled(TableRow)(() => ({
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

const DataStoreViewer = () => {
    const [originalData, setOriginalData] = useState([]);
    const [modifiedData, setModifiedData] = useState([]);
    const [filterTestID, setFilterTestID] = useState('all');
    const [filterValue, setFilterValue] = useState('');
    const [testIDs, setTestIDs] = useState(['all']);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchData = useCallback(async () => {
        resetFilters();
        try {
            const response = await axios.get('http://localhost:3001/api/data-store/true', {
                auth: {
                    username: 'admin',
                    password: 'admin123!'
                }
            });
            const data = response.data;

            if (data && Array.isArray(data)) {
                const testIDs = ['all', ...new Set(data.map(entry => entry.testID))];

                setOriginalData(data);
                setModifiedData(data);
                setTestIDs(testIDs);
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

    const handleFilterTestIDChange = (event) => {
        const value = event.target.value;
        setFilterTestID(value);
        applyFilters(value, filterValue);
    };

    const handleFilterValueChange = (event) => {
        const value = event.target.value;
        setFilterValue(value);
        applyFilters(filterTestID, value);
    };

    const applyFilters = (testID, value) => {
        let filteredData = originalData;

        if (testID !== 'all') {
            filteredData = filteredData.filter(entry => entry.testID === testID);
        }

        if (value) {
            filteredData = filteredData.filter(entry =>
                entry.value.toLowerCase().includes(value.toLowerCase()) ||
                entry.key.toLowerCase().includes(value.toLowerCase())
            );
        }

        setModifiedData(filteredData);
        setPage(0);
    };

    const resetFilters = () => {
        setFilterTestID('all');
        setFilterValue('');
        setModifiedData(originalData);
    };

    const handleAutoUpdateChange = (event) => {
        setAutoUpdate(event.target.checked);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <div style={{ padding: 20 }}>
                <div className="filter-section" style={{ marginBottom: 20 }}>
                    <FormControl variant="outlined" style={{ marginRight: 10, minWidth: 200 }}>
                        <InputLabel id="filter-testid-label" style={{ color: 'white' }}>Filter Test ID</InputLabel>
                        <Select
                            labelId="filter-testid-label"
                            id="filter-testid"
                            value={filterTestID}
                            onChange={handleFilterTestIDChange}
                            label="Filter Test ID"
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
                            {testIDs.map(testID => (
                                <MenuItem key={testID} value={testID}>{testID}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        variant="outlined"
                        placeholder="Enter text to filter"
                        value={filterValue}
                        onChange={handleFilterValueChange}
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
                        Update Data
                    </Button>
                    <FormControlLabel
                        control={<Checkbox checked={autoUpdate} onChange={handleAutoUpdateChange} />}
                        label="Auto Update"
                        style={{ borderColor: 'white', color: 'white', marginLeft: 10 }}
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
                                <StyledTableCell component="th" scope="head">TestID</StyledTableCell>
                                <StyledTableCell component="th" scope="head">Key</StyledTableCell>
                                <StyledTableCell component="th" scope="head">Value</StyledTableCell>
                                <StyledTableCell component="th" scope="head">Created at</StyledTableCell>
                                <StyledTableCell component="th" scope="head">Updated at</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {modifiedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((entry) => (
                                <StyledTableRow key={`${entry.testID}-${entry.key}`}>
                                    <StyledTableCell component="cell" scope="row">{entry.testID}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{entry.key}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{entry.value}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{dateUtils.formatDatabaseDate(entry["createdAt"])}</StyledTableCell>
                                    <StyledTableCell component="cell" scope="row">{dateUtils.formatDatabaseDate(entry["updatedAt"])}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        sx={{
                            backgroundColor: "#252525",
                            color: "#ffffff",
                            borderLeft: "solid 1px white",
                            borderRight: "solid 1px white",
                            borderBottom: "solid 1px white"
                        }}
                        count={modifiedData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </div>
        </div>
    );
};

export default DataStoreViewer;
