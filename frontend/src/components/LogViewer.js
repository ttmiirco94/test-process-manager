import React, {useState, useEffect} from 'react';
import axios from 'axios';
import ReturnSafeTextComponent from "./ReturnSafeTextComponent";

const LogViewer = ({username, password}) => {
    const [logs, setLogs] = useState('');
    const [filteredLogs, setFilteredLogs] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('backward');
    let logData;
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get('http://localhost:3001/logs', {
                    headers: {
                        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
                    }
                });
                logData = strReplacedCharacters(response.data).split('<br>').map(line => line.replace(/^(\d+): /, '')).reverse().slice(1, 5000);
                console.log(logData);
                setLogs(logData);
                setFilteredLogs(logData);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };
        fetchLogs();
    }, [username, password]);

    const strReplacedCharacters = (str) => {
        return str.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\r\n|\r|\n/g, '<br>');
    }

    const returnOutputLog = () => {
        return (
            logs.map((entry, i) => (
                    <div key={i} className="output-entry">
                        <span className="timestamp"><label>{i}:</label></span> <ReturnSafeTextComponent text={entry.replace(/\r\n|\r|\n/g, '<br>')}/>
                    </div>
                ))
        )
    }

    const addLineNumbers = (dataStr) => {

    };

    const handleSearch = () => {

    };

    const handleSort = () => {
    };

    if (loading) return <div>Loading logs...</div>;
    if (error) return <div>Error loading logs: {error.message}</div>;

    return (
        <div>
            <div className="button-group">
                <input
                    type="text"
                    placeholder="Search logs"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{marginBottom: '10px'}}
                />
                <button className="send-output-button" onClick={handleSearch}>Search</button>
            </div>
            <div className="output">
                {returnOutputLog()}
            </div>
        </div>
    );
};

export default LogViewer;
