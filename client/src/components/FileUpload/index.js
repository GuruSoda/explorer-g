import React, { useContext, useState, useEffect, useDebugValue } from 'react'
// import { postFile } from 'services/navegadorService'
import { verifyFile, postFile } from 'services/fsService'

function FileUpload(prop) {

    const [files, setFiles] = useState([])
    const [destino, setDestino] = useState("")
    const [enviar, setEnviar] = useState('')
    const [status, setStatus] = useState({ok: [], errors: [], omitidos: [], total: 0})

    useEffect(() => {
        if (!enviar) return

//        console.log('enviando:', enviar)

        verifyFile(destino, enviar)
            .then(ok => { // archivo existe en destino/server
                console.log('Archivo existe, no se envia', ok)
                status.omitidos.push(enviar.name)
                setStatus({ok: status.ok, errors: status.errors, omitidos: status.omitidos, total: status.total})
            })
            .catch(async err => { // archivo NO existe en destino/server
                try {
                    await postFile(destino, enviar)
                    status.ok.push(enviar.name)                        
                    setStatus({ok: status.ok, errors: status.errors, omitidos: status.omitidos, total: status.total})
                } catch(e) {
                    console.log('Error al enviar:', e)
                    status.errors.push(enviar.name)                        
                    setStatus({ok: status.ok, errors: status.errors, omitidos: status.omitidos})
                }
            })
    }, [enviar])

    // Si cambio el estado de "status" es por que termino con el archivo a enviar
    useEffect(() => {
        if (files.length > 0) setEnviar(files.shift())
    }, [status])

    async function onSelectedFiles(event) {
        setFiles(files => ([...event.target.files]))
        setDestino(prop.directory)
        setStatus({ok: [], errors: [], omitidos: [], total: event.target.files.length})
    }

    function onCancelUpload() {
        console.log('Cancelando!', files.length)
        setFiles([])
        setEnviar('')
    }

    // se esta enviando algo
    if (files.length > 0) {
        return (
            <div className="component-fileupload">
                <div className="infofile">{"Current:" + files[0].name + " Sent:" + (status.ok.length || 0) + " Ommited:" + (status.omitidos.length || 0) + " Failed:" + (status.errors.length || 0) + " Total:" + status.total}</div>
                <div className="waiting"></div>
                <span className="material-icons" onClick={onCancelUpload}>cancel</span>
            </div>
        )
        // no se esta enviando nada
    } else {
       return (
            <div className="component-fileupload">
                { files.length === 0 && <div className="infofile">{"Uploaded:" + (status.ok.length || 0) + " Ommited:" + (status.omitidos.length || 0) + " Failed:" + (status.errors.length || 0) + " Total:" + status.total}</div>}
                <input type="file" id="file-upload" multiple onChange={onSelectedFiles}/>
                <label className="custom-file-upload item" htmlFor="file-upload">
                    <span className="material-icons">file_upload</span>
                </label>
            </div>
        )
    }
}

export default FileUpload
