import React, { useContext, useState, useEffect, useDebugValue } from 'react'
// import { postFile } from 'services/navegadorService'
import { verifyFile, postFile } from 'services/fsService'

function FileUpload(prop) {

    const [files, setFiles] = useState([])
    const [total, setTotal] = useState(0)
    const [enviados, setEnviados] = useState(0)
    const [uploads, setUploads] = useState(0)
    const [destino, setDestino] = useState("")
    const [status, setStatus] = useState({ok: [], errors: [], omitidos: []})

    useEffect(() => {

        function upload() {

            verifyFile(destino, files[0])
                .then(ok => { // archivo existe en destino/server
                    console.log('Archivo existe, no se envia', ok)
                    status.omitidos.push(files[0].name)
                    setStatus(status => ({ok: status.ok, errors: status.errors, omitidos: status.omitidos}))
                })
                .catch(async err => { // archivo NO existe en destino/server
                    try {
                        await postFile(destino, files[0])
                        setEnviados(enviados => (enviados + 1))
                        status.ok.push(files[0].name)
                        setStatus(status => ({ok: status.ok, errors: status.errors, omitidos: status.omitidos}))
                    } catch(e) {
                        console.log('Error al enviar:', e)
                        status.errors.push(files[0].name)
                        setStatus(status => ({ok: status.ok, errors: status.errors, omitidos: status.omitidos}))
                    }
                })

            setFiles(files => (files.slice(1)))
        }

        if (files.length > 0) upload()
    }, [files])

    async function onSelectedFiles(event) {

        setFiles(files => ([...event.target.files]))
        setTotal(event.target.files.length)
        setDestino(prop.directory)
        setEnviados(0)
        setStatus({ok: [], errors: [], omitidos: []})
        setUploads(uploads => (uploads+1))
    }

    function onCancelUpload() {
        console.log('Cancelando!', files.length)
        setFiles([])
    }

    // se esta enviando algo
    if (files.length > 0) {
        return (
            <div className="component-fileupload">
                <div className="infofile">{"Current:" + files[0].name + " Sent:" + (status.ok.length || 0) + " Ommited:" + (status.omitidos.length || 0) + " Failed:" + (status.errors.length || 0) + " Total:" + total}</div>
                <div className="waiting"></div>
                <span className="material-icons" onClick={onCancelUpload}>cancel</span>
            </div>
        )
        // no se esta enviando nada
    } else {
       return (
            <div className="component-fileupload">
                { uploads > 0 && <div className="infofile">{"Uploaded:" + (status.ok.length || 0) + " Ommited:" + (status.omitidos.length || 0) + " Failed:" + (status.errors.length || 0) + " Total:" + total}</div>}
                <input type="file" id="file-upload" multiple onChange={onSelectedFiles}/>
                <label className="custom-file-upload item" htmlFor="file-upload">
                    <span className="material-icons">file_upload</span>
                </label>                
            </div>
        )
    }
}

export default FileUpload
