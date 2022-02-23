import React from 'react';
import prettyBytes from 'pretty-bytes';

function ItemIcon(prop) {

    function click() {
        prop.callback(prop.data)
    };

    return (
        <>
        </>
    )
}

export default ItemIcon
