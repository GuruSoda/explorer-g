import React, { useContext, useEffect, useState } from 'react';
import { useKeycloak } from "@react-keycloak/web";
import prettyBytes from 'pretty-bytes';
// import { getHash } from 'services/navegadorService';
import { getHash, getRemoveFile } from 'services/fsService';
import { PathContext } from 'contexts/pathContext';
import  IndigoPlayer from 'indigo-player'
import "indigo-player/lib/indigo-theme.css";

const ext_images = ['jpg', 'jpeg', 'png', 'gif']
const ext_videos = ['mp4', 'avi', 'ogg', 'WebM', 'mpeg', '3gp', 'quicktime']

function ItemLine(prop) {
    const [bytes, setBytes] = useState(false)
    const [hash, setHash] = useState('')
    const [waitHash, setWaitHash] = useState(false)
    const [preview, setPreview] = useState(prop.preview || false)
    const [usage, setUsage] = useState({})
    const path = useContext(PathContext)
    const { keycloak, initialized } = useKeycloak()

    const fecha = new Date(prop.data.modified)
    useEffect(() => {

        if (preview && inExtension(ext_videos)) {
            const config = {
                autoplay: true,
                sources: [
                  {
                    type: 'mp4',
                    src: (process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'fs/view?file=' + (prop.isSearch ? prop.data.name : path + prop.data.name),
                  }
                ],
              };

            const element = document.getElementById('video');
            const player = IndigoPlayer.init(element, config);

            console.log('video:', config.sources[0])
            console.log('element:', element)
            console.log('player', player)
        }
    }, [preview])

    function click() {
        prop.callback(prop.data)
    }

    function onClickRemove() {
        const file = prop.isSearch ? prop.data.name : path + prop.data.name
        getRemoveFile(file).then(function (res) {
        }).catch(function (err) {
        })
    }

    function onClickUsageDir() {
        setWaitHash(true)
//        const eventSource = new EventSource((process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'navtools/usagesse' + path + prop.data.name)
        const eventSource = new EventSource((process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'fs/countsse?directory=' + path + prop.data.name)
        eventSource.addEventListener("Processing", progressUsage);
        eventSource.addEventListener("close", (event) => {
            eventSource.close();
            setUsage(JSON.parse(event.data))
            setWaitHash(false)
        });
    }

    function progressUsage(event) {
        setUsage(JSON.parse(event.data))
    }

    function closeProgressUsage(event) {
        console.log(event.data)
    }

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
                setHash(res)
            }).catch(function (err) {
                setWaitHash(false)
                setHash(err)
            })
        }
    }

    function isImage() {
        if (prop.data.type === 'file') {
            const ext = prop.data.name.split('.').pop()
            
            return ext_images.find(img_ext => img_ext.toLowerCase() === ext.toLowerCase())
        } else 
            return false
    }

    function inExtension(exts) {
        if (prop.data.type === 'file') {
            const ext = prop.data.name.split('.').pop()

            return exts.find(img_ext => img_ext.toLowerCase() === ext.toLowerCase())
        } else
            return false
    }

    return (
        <li>
            <div className={"item " + (preview && isImage() ? "sin-margin" : "")}>
                { prop.data.type === 'directory' &&
                    <>
                        <span className="material-icons">folder</span>
                        <div className="name directory" onClick={click} >{prop.data.name}</div>
                        { typeof usage.sum === 'object' && <div className="infofile">{'Dirs:' + usage.sum.directories + ' Files:' + usage.sum.files + ' Size:' + prettyBytes(usage.sum.bytes)}</div>}
                        { waitHash && <div className="waiting"></div> }
                        <div className="dir">{"<DIR>"}</div>
                        <div className="date">{fecha.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit"})}</div>
                        <div className="time">{fecha.toLocaleTimeString({ hour12: false})}</div>
                    </>
                }

                { prop.data.type === 'file' && 
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
                    { keycloak.authenticated && prop.data.type === 'file' && <span className="material-icons" onClick={onClickHash}>add</span> }
                    { keycloak.authenticated && prop.data.type === 'file' && <span className="material-icons" onClick={() => setPreview(!preview)}>play_circle_filled</span> }
                    { keycloak.authenticated && prop.data.type === 'directory' && <span className="material-icons" onClick={onClickUsageDir}>info</span>}
                    { keycloak.authenticated && prop.data.type === 'file' && <span className="material-icons" onClick={onClickHash}>fingerprint</span> }
                    { prop.data.type === 'file' && <a href={(process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'fs/download?file=' + (prop.isSearch ? prop.data.name : path + prop.data.name)} download={prop.data.name}><span className="material-icons">file_download</span></a>}
                    { false && <span className="material-icons" onClick={onClickInfo}>edit</span> }
                    { keycloak.authenticated && prop.data.type === 'file' && <span className="material-icons" onClick={onClickRemove}>delete_forever</span> }
                    { false && prop.data.type === 'directory' && <span className="material-icons">image_aspect_ratio</span> }
                </div>
            </div>
            { preview && isImage() && (
                <div className="preview">
                    { <img className="item-preview" src={(process.env.NODE_ENV === 'development' ? 'http://localhost:3001/' : window.location.href) + 'fs/view?file=' + (prop.isSearch ? prop.data.name : path + prop.data.name)}/> }
                </div> ) 
            }

            { preview && inExtension(ext_videos) && (
                <div className="preview">
                    <div id="video" className="item-preview" style={{width: '100%'}}></div>
                </div> )
            }

        </li>
    )
}

export default ItemLine
