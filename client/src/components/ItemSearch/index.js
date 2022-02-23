import React from 'react';
import svg_directory from 'assets/icons8-folder.svg'
import svg_archive from 'assets/icons8-file.svg'
import svg_info from 'assets/icons8-info.svg'
import svg_download from 'assets/bxs-download.svg'
import prettyBytes from 'pretty-bytes';

function ItemSearch(prop) {

    const fecha = new Date(prop.data.modified)

    function click() {
        //    console.log(prop.data.name)
        prop.callback(prop.data)
    };

    return (
        <li className="item" >
            { /*  <img className="icon-type" src={(prop.data.type === 'directory') ? svg_directory : svg_archive} alt="Item" /> */}
            <span className="material-icons">{(prop.data.type === 'directory') ? 'folder' : 'insert_drive_file'}</span>
            <div className={(prop.data.type === 'directory') ? "name directory" : "name"} onClick={click} >{prop.data.name}</div>
            <div className="actions">
                {prop.data.type === 'directory' && <div className="dir">{"<DIR>"}</div>}
                {prop.data.type === 'file' && <div className="size">{prettyBytes(prop.data.size)}</div>}
                {prop.data.type === 'file' && <div className="date">{fecha.toLocaleString({ hour12: false })}</div>}
                { /* <span class="material-icons">info</span> */}
            </div>
        </li>
    )
}

export default ItemSearch
