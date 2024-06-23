import React from 'react';

const ReturnSafeTextComponent = ({ text }) => {
    function isBase64(str) {
        // Regular expression to check if a string is base64 encoded
        const base64Regex = /^(?:[A-Za-z0-9+]{4})*(?:[A-Za-z0-9+]{2}==|[A-Za-z0-9+]{3}=)?$/;

        // Check if the string matches the regex
        if (typeof str !== 'string' || !base64Regex.test(str)) {
            return false;
        }

        // Try decoding the string
        try {
            atob(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    function decodeBase64(str) {
        if (isBase64(str)) {
            return atob(str);
        } else {
            return str; // or you can throw an error or return the original string
        }
    }

    // First escape HTML entities, then replace new lines with <br>
    let formattedText = decodeBase64(text)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n|\r|\n/g, '<br>');

    // Split the formatted text by <br> tags to apply additional styling to new lines
    const lines = formattedText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').split('<br>').map((line, index) => (
        index === 0 ? line : `<span class="new-line">${line}</span>`
    )).join('<br>');

    return <span className="message" dangerouslySetInnerHTML={{ __html: lines }} />;
};

export default ReturnSafeTextComponent;