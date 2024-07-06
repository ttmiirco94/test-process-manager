import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import ReturnSafeTextComponent from './ReturnSafeTextComponent';
import DateUtils from '../utils/date-utils';

function TestCard({ testID, type, output, index, deleteTest, isLoading }) {
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
                            <span className="timestamp">{DateUtils.getFormattedIsoDate(entry.timestamp)}</span> <ReturnSafeTextComponent text={entry.message} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TestCard;