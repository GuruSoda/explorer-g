const config = require('../../config')
const path = require('path')
const store = require('./store')

function absolutePath(directory) {
    return path.join(config.rootdir, directory)
}

function relativePath(directory) {
    return directory.substr(config.rootdir.length)
}

function addFile(dataFile) {
    return new Promise((resolve, reject) => {
//        if (!dataFile.file || !dataFile.bytes || !dataFile.date) {
        if (!dataFile.file) {
            reject('Invalid parameters (file or bytes or date cannot be empty)')
            return
        }

        store.add(dataFile)
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

function infoFile(file) {
//    console.log('File:', file)
//    console.log('relative:', relativePath(file))
//    console.log('absolute:', absolutePath(file))
    return new Promise((resolve, reject) => {
        store.infoFile(absolutePath(file))
            .then(message => {
                message.file = relativePath(message.file)
                resolve(message)
            })
            .catch(message => {
                if (message.file) message.file = absolutePath(file)
                reject(message)
            })
    })
}

function directorySize(directory) {
    return new Promise((resolve, reject) => {
        store.directorySize(absolutePath(directory))
            .then(message => {
                resolve(message)
            })
            .catch(message => {
                reject(message)
            })
    })
}

function countByExtension(directory) {
    return new Promise((resolve, reject) => {
        store.countByExtension(absolutePath(directory))
            .then(message => {
                resolve(message)
            })
            .catch(message => {
                reject(message)
            })
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

function addDirectory(directory) {
    return new Promise(async (resolve, reject) => {
            store.addDirectory(absolutePath(directory))
                .then(message => resolve(message))
                .catch(message => reject(message))
    })
}

function init() {
    store.init()
}

function end() {
    store.end()
}

function equalsByChecksum(path) {
    return new Promise((resolve, reject) => {
        store.equalsByChecksum(absolutePath(path))
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

module.exports = {
    add: addFile,
    list: listFiles,
    addDirectory: addDirectory,
    count: count,
    init,
    end,
    info: infoFile,
    equalsByChecksum,
    relativePath,
    directorySize,
    countByExtension
}
