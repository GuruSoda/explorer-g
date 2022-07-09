import { apiFS } from 'config/api'

// Interesante para entender este modulo.
// https://es.javascript.info/promise-chaining
//
function handleResponse(response) {
    if (response.data.error)
    //    return new Promise((resolve, reject) => {reject(response.data.error)})
        throw response.data.error
    else
        return response.data.body
}

function handleError(error) {
    if (error.response) {
        // La respuesta fue hecha y el servidor respondió con un código de estado
        // que esta fuera del rango de 2xx
        throw error.response.data
        // return error.response.status
        // return error.response.headers
    } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        // `error.request` es una instancia de XMLHttpRequest en el navegador y una instancia de
        // http.ClientRequest en node.js
        throw error.request
    } else if (error.message) {
        // Algo paso al preparar la petición que lanzo un Error
        throw error.message
    } else {
        throw error        
    }
}

function handleRequest(url, config) {

    return apiFS(url, config)
        .then(response => handleResponse(response))
        .catch(error => handleError(error))
}

export function getList(directory) {
    const config = {
        method: 'get',
        params: {
            directory: directory
        }
    }

    return handleRequest('/list', config)
}

export function getSearch (path, strSearch) {

    const config = {
        method: 'get',
        params: {
            directory: path,
            pattern: strSearch
        }
    }

    return handleRequest('/find', config)
}

export function getHash (file, algo) {

    const config = {
        method: 'get',
        params: {
            file: file,
            algo: algo
        }
    }

    return handleRequest('/hash', config)
}

export function getCRC (file, algo) {

    const config = {
        method: 'get',
        params: {
            file: file,
            algo: algo
        }
    }

    return handleRequest('/crc', config)
}

export function getRemoveFile (file) {

    const config = {
        method: 'delete',
        params: {
            file: file
        }
    }

    return handleRequest('/rm', config)
}

export function getMkDir (directory) {

    const config = {
        method: 'post',
        data: {
            newdirectory: directory
        }
    }

    return handleRequest('/mkdir', config)
}

export function getCount (directory) {

    const config = {
        method: 'get',
        params: {
            directory: directory
        }
    }

    return handleRequest('/count', config)
}

export function postFile (directory, file) {

    const formData = new FormData()

    formData.append("file", file)
    formData.append("date", file.lastModifiedDate)
    formData.append("destination", directory)

    const config = {
        method: 'post',
        data: formData
    }

    return handleRequest('/upload', config)
}

export function verifyFile (directorio, file) {

    const config = {
        method: 'get',
        params: {
            file: directorio + file.name,
            date: file.lastModified,
            size: file.size
        }
    }

    return handleRequest('/verify', config)
}
