const store = require('./store')
const navegador = require('../../models/navegadorfsModel')

function addFile(dataFile) {
    return new Promise((resolve, reject) => {
        if (!dataFile.file || !dataFile.bytes || !dataFile.date) {
            reject('Invalid parameters (file or bytes or date cannot be empty)')
            return
        }

        store.add(dataFile)
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

function listFiles() {
    return new Promise((resolve, reject) => {
        store.list()
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

function count() {
    return new Promise((resolve, reject) => {
        store.count()
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

async function addDirectory(directory) {
    return new Promise(async (resolve, reject) => {

            store.addDirectory(directory)
                .then(message => resolve(message))
                .catch(message => reject(message))
    })
}

module.exports = {
    add: addFile,
    list: listFiles,
    addDirectory: addDirectory,
    count: count
}
