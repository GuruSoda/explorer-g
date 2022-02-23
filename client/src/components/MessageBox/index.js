import React from 'react';

function MessageBox(props) {
    return (
        <>
        <div className="messagebox">
            <div className="message"><h1>{props.message}</h1></div>
        </div>
        </>
    )
}

export default MessageBox