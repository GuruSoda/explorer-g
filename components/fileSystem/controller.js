const service = require('./service')
const config = require('../../config')
const path = require('path')

function absolutePath(directory) {
    return path.join(config.rootdir, directory)
}

function list(directory) {
    return new Promise(async (resolve, reject) => {
        try {
            let content = []
            await service.list(absolutePath(directory), (item) => {content.push(item)})
            resolve(content)
        } catch(message) {
            reject(message)
        }
    })
}

function exists(file) {
    return new Promise(async (resolve, reject) => {
        if (!file) throw('Parameter file is required')

        service.existsEntry(absolutePath(file)) ? resolve() : reject()
    })
}

function verify(file, size, date) {

    return new Promise(async (resolve, reject) => {
        if (!file) reject('Parameter file is required')

        const fileInfo = service.fileInfo(absolutePath(file))

        if (fileInfo.error) reject(fileInfo.error)

        if (size)
            if (size != fileInfo.size) reject('Diferents Size: ' + size + ' <> ' + fileInfo.size)

        if (date)
            if ((new Date(parseInt(date, 10))).toString() !== fileInfo.modified.toString()) reject('Diferents Dates: ' + (new Date(parseInt(date, 10))).toString() + ' <> ' + fileInfo.modified.toString())

        resolve('ok')
    })
}

function mkdir(newDir) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!newDir) throw('Parameter newdir is required')

            await service.makeDirectory(absolutePath(newDir))

            resolve()
        } catch(message) {
            reject(message)
        }
    })
}

function rm(file) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!file) throw('Parameter file is required')

            await service.removeFile(absolutePath(file))

            resolve()
        } catch(message) {
            reject(message)
        }
    })
}

function hash(file, algo='md5') {
    return new Promise(async (resolve, reject) => {
        try {
            if (!file || !algo) throw('Invalid parameters (file and algo is required)')

            const result = await service.hash(absolutePath(file), algo)

            resolve(result)
        } catch(message) {
            reject(message)
        }
    })
}

function crc(file, algo='crc32') {
    return new Promise(async (resolve, reject) => {
        try {
            if (!file || !algo) throw('Invalid parameters (file and algo is required)')

            const result = await service.crc(absolutePath(file), algo)

            resolve(result)
        } catch(message) {
            reject(message)
        }
    })
}

function count(directory) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!directory) throw('Invalid parameters (directory is required).')

            const result = await service.count(absolutePath(directory))

            resolve(result)
        } catch(message) {
            reject(message)
        }
    })
}

function countWithUpdates(directory, cb, ms) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!directory) throw('Invalid parameters (directory is required).')

            function cbcontroller(data) {
                data.current.directory = data.current.directory.replace(config.rootdir, '')
                data.current.file = data.current.file.replace(config.rootdir, '')
                cb(data)
            }

            const result = await service.countWithUpdates(absolutePath(directory), cbcontroller, ms || 750)

            resolve(result)
        } catch(message) {
            reject(message)
        }
    })
}

function find(directory, pattern) {

    return new Promise(async (resolve, reject) => {
        try {
            if (!directory) throw('Invalid parameters (directory is required).')

            const result = await service.find(absolutePath(directory), pattern)

            const resfiltered = result.map(item => {
                item.name = item.name.substr(config.rootdir.length)
                return item
            })

            resolve(resfiltered)
        } catch(message) {
            reject(message)
        }
    })
}

function singleUpload(paramsUpload) {

    return new Promise(async (resolve, reject) => {
        try {
            if (!paramsUpload.fileName || !paramsUpload.dirDestination || !paramsUpload.tempFile) throw('Invalid Parameters (fileName or fileDestination or tempFiles is required).')

            const pathDest = absolutePath(path.join(paramsUpload.dirDestination, paramsUpload.fileName))

            await service.move(paramsUpload.tempFile, pathDest)

            if (paramsUpload.fileDate) await service.changeTimes(pathDest, paramsUpload.fileDate, paramsUpload.fileDate)

            resolve()
        } catch(message) {
            reject(message)
        }
    })
}

function download(fileName) {
    return new Promise(async (resolve, reject) => {
        const file = absolutePath(fileName)

        if (!service.existsFile(file)) 
            reject('File not Exists.')
        else
            resolve(file)
    })
}

module.exports = {
    list,
    exists,
    verify,
    mkdir,
    rm,
    hash,
    crc,
    count,
    countWithUpdates,
    find,
    singleUpload,
    download
}
