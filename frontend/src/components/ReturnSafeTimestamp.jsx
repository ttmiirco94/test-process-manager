import React from 'react';

const ReturnSafeTimestampComponent = ({ text }) => {
    // First escape HTML entities, then replace new lines with <br>
    const formattedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n|\r|\n/g, '<br>');

    // Split the formatted text by <br> tags to apply additional styling to new lines
    const lines = formattedText.split('<br>').map((line, index) => (
        index === 0 ? line : `<span class="new-line">${line}</span>`
    )).join('<br>');

    return <span className="timestamp" dangerouslySetInnerHTML={{ __html: lines }} />;
};

export default ReturnSafeTimestampComponent;
