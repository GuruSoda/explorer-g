import React, { useContext, useState } from 'react';
import svg_directory from 'assets/icons8-folder.svg'
import svg_archive from 'assets/icons8-file.svg'
import svg_info from 'assets/icons8-info.svg'
import svg_download from 'assets/bxs-download.svg'
import prettyBytes from 'pretty-bytes';
import { getHash } from 'services/navegadorService';
import { PathContext } from 'contexts/pathContext';

function ItemLine(prop) {
    const [bytes, setBytes] = useState(false)
    const [hash, setHash] = useState('')
    const [waitHash, setWaitHash] = useState(false)
    const path = useContext(PathContext)

    const fecha = new Date(prop.data.modified)

    function click() {
        prop.callback(prop.data)
    };

    function onClickInfo(e) {
        console.log(prop)
    }

    function onClickSize(e) {
        setBytes(!bytes)
    }

    function onClickHash(e) {
        if (hash) {
            setHash('')
        } else {
            setWaitHash(true)
            const file = prop.isSearch ? prop.data.name : path + prop.data.name
            getHash(file).then(function (res) {
                setWaitHash(false)
                setHash(res.hash ? res.hash : (res.err ? res.err : 'ERROR!'))
            }).catch(function (err) {
                setWaitHash(false)
                setHash(err)
            })
        }
    }

    return (
        <li className="item">
            {prop.data.type === 'directory' &&
                <>
                    <span className="material-icons">folder</span>
                    <div className="name directory" onClick={click} >{prop.data.name}</div>
                    <div className="dir">{"<DIR>"}</div>
                    <div className="date">{fecha.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit"})}</div>
                    <div className="time">{fecha.toLocaleTimeString({ hour12: false})}</div>
                </>
            }

            {prop.data.type === 'file' && 
                <>
                    <span className="material-icons">insert_drive_file</span>
                    <div className="name" onClick={click} >{prop.data.name}</div>
                    { waitHash && <div className="waiting"></div> }
                    { hash && <div className="infofile">{hash}</div> }
                    <div className="size" onClick={onClickSize}>{ bytes ? prop.data.size : prettyBytes(prop.data.size)}</div>
                    <div className="date">{fecha.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit"})}</div>
                    <div className="time">{fecha.toLocaleTimeString({ hour12: false})}</div>
                </>
            }

            <div className="actions">
                { prop.data.type === 'file' && <span className="material-icons" onClick={onClickHash}>fingerprint</span> }
                { prop.data.type === 'file' && <a href={(process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : window.location.href) + 'navtools/download' + (prop.isSearch ? prop.data.name : path + prop.data.name)} download={prop.data.name}><span className="material-icons">file_download</span></a>}
                { false && <span className="material-icons" onClick={onClickInfo}>edit</span> }
                { false && <span className="material-icons">delete_forever</span> }
                { false && prop.data.type === 'directory' && <span className="material-icons">image_aspect_ratio</span> }
            </div>
        </li>
    )
}

export default ItemLine
