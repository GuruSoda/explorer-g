const fsAsync = require('fs/promises')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const makecrc = require('crc')
const subdirectory = require('files-in-directory')

function exists(path) {
    const stat = fs.lstatSync(path, {bigint: false, throwIfNoEntry: false})

    return stat ? true : false
}

function isDirectory(path) {
    try {
        const stat = fs.lstatSync(path, {bigint: false, throwIfNoEntry: true})
        return stat.isDirectory()
    } catch (e) {
        return false
    }
}

function fileType(stat) {
    if (stat.isFile()) return 'file'
    else if (stat.isDirectory()) return 'directory'
    else if (stat.isSocket()) return 'socket'
    else if (stat.isSymbolicLink()) return 'symboliclink'
    else if (stat.isBlockDevice()) return 'blockdevice'
    else if (stat.isCharacterDevice()) return 'characterdevice'
    else if (stat.isFIFO()) return 'fifo'
    else return 'unknow'
}

function fileStat(absolutePath) {
    let stat
    let info = {}

    try {
        stat = fs.lstatSync(absolutePath, {bigint: false, throwIfNoEntry: true})

        info = {
            name: path.posix.basename(absolutePath),
            size: stat.size,
            type: fileType(stat),
            modified: stat.mtime,
            access: stat.atime,
            change: stat.ctime,
        }
    } catch (e) {
        info = {
            name: path.posix.basename(absolutePath),
            size: 0,
            type: 'unknow',
            modified: 0,
            access: 0,
            change: 0,
            error: e.code
        }
    }

    return info
}

// Esta funciona recorreo a partir de un directorio todo su contenido incluido cada subdirectorio
// Al callback solo le informa la ruta del archivo y/o directorio encontrado
function recursiveDirectorySync (directory, cb, options = {directories:false, files:true}) {

    options.directories = options.directories ? true : false
    options.files = options.files ? true : false
    
    counterSizeDirectory(directory)

    function counterSizeDirectory(directory) {

        try {
            const listado = fs.readdirSync(directory, {withFileTypes: true, throwIfNoEntry: true})
    
            for (const file of listado) {
                let pathFile = path.join(directory, file.name)

                if (file.isDirectory()) {
                    if (options.directories) if (cb) cb(pathFile)
                    counterSizeDirectory(pathFile)
                } else if (file.isFile()) {
                    if (options.files) if (cb) cb(pathFile)
                } else {
                }
            }               
        } catch (e) {
            throw(e)
        }
    }
}

function list (directory, cb, options = {directories:true, files:true}) {

    return new Promise(async function (resolve, reject) {
        if (!exists(directory) || !isDirectory(directory)) reject('Directory not exists or not is a directory.')

        try {
            const listado = await fsAsync.readdir(directory, {withFileTypes: true})            

            for (const file of listado) {
                let pathArchivo = path.join(directory, file.name)

                if (file.isDirectory()) {
                    if (options.directories) if (cb) cb(fileStat(pathArchivo))
                } else if (file.isFile()) {
                    if (options.files) if (cb) cb(fileStat(pathArchivo))
                } else {
                }
            }

            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

function subDirContent (directory, cb, options = {directories:false,files:true}) {
}

function existsEntry(file) {
    return exists(file)
}

function existsFile(file) {
    return fileStat(file).type === 'file' ? true : false
}

async function makeDirectory(newDir) {
    try {
        if (exists(newDir)) throw('Directory Exists')

        await fsAsync.mkdir(newDir);
    } catch (err) {
        throw err;
    }
}

async function removeFile(file) {
    try {
        if (!exists(file)) throw('File not Exists')

        await fsAsync.unlink(file)
    } catch (err) {
        throw err;
    }
}

function crc(file, algorithm='crc32') {

    return new Promise(function (resolve, reject) {
        const readStream = fs.createReadStream(file, {highWaterMark: 64*1024, enconding: 'binary'});
        let result = undefined

        readStream.on('data', (chunk) => {
            switch(algorithm) {
                case 'crc32': result = makecrc.crc32(chunk, result); break;
                case 'crc16': result = makecrc.crc16(chunk, result); break;
                case 'crc8': result = makecrc.crc8(chunk, result); break;
                default:
                    reject('Invalid Algorithm.')
            }
        })

        readStream.on('end', () => {
            switch(algorithm) {
                case 'crc32': resolve(result.toString(16).padStart(8, '0')); break;
                case 'crc16': resolve(result.toString(8).padStart(4, '0')); break;
                case 'crc8': resolve(result.toString(4).padStart(2, '0')); break;
                default:
                    reject('Invalid Algorithm.')
            }
        })

        readStream.on('error', (err) => {
            reject(err)
        })
    })
}

/*
var data = "do shash'owania";
var crypto = require('crypto');
crypto.createHash('md5').update(data).digest("hex");
*/
function hash(file, algorithm='md5') {

    return new Promise(function (resolve, reject) {

        const readStream = fs.createReadStream(file, {highWaterMark: 64*1024, enconding: 'binary'})
        const hash = crypto.createHash(algorithm)

        readStream.on('data', (chunk) => {
            hash.update(chunk)
        })

        readStream.on('end', () => {
            resolve(hash.digest('hex'))
        })

        readStream.on('error', (err) => {
            reject(err)
        })
    })
}

function count(directory) {

    return new Promise(function (resolve, reject) {

            if (!exists(directory) || !isDirectory(directory)) reject('Directory not exists or not is a directory.')

            let files=0, size=0

            let it = subdirectory(directory)

            while (it.name) {

                files++
                size += it.stat().size

                it = it.next()
            }

            resolve({files, size})
       })
}

async function countWithUpdates (directory, cb, ms) {

    if (!ms) ms = 750

    let infoDirectory = {
        sum: {
            files: 0,
            bytes: 0,
            directories: 0
        },
        current: {
            file: '',
            directory: ''
        }
    }

    try {

        let inicio = new Date()

        cb(infoDirectory)
        
        async function counterSizeDirectory(directory) {

            try {
                const listado = await fsAsync.readdir(directory, {withFileTypes: true, throwIfNoEntry: true})

                for (const file of listado) {
                    let pathFile = path.join(directory, file.name)

                    let fin = new Date()
                    if ((fin.getTime() - inicio.getTime()) > ms ) {
                        if (cb) {
                            infoDirectory.current.directory = infoDirectory.current.directory
                            infoDirectory.current.file = infoDirectory.current.file
                            cb(infoDirectory)
                        }
                        inicio = new Date()
                    }

                    if (file.isDirectory()) {
                        infoDirectory.sum.directories++
                        infoDirectory.current.directory = pathFile
                        await counterSizeDirectory(pathFile)
                    } else if (file.isFile()) {
                        const stat = fs.lstatSync(pathFile, {bigint: false, throwIfNoEntry: false})
                        infoDirectory.sum.bytes += stat.size
                        infoDirectory.sum.files++
                        infoDirectory.current.file = pathFile
                    }
                }
            } catch (e) {
                console.log('Error Procesando Directorio:', directory, '(' + e + ')')
            }
        }

        await counterSizeDirectory(directory)

    } catch (e) {
    }

    return infoDirectory
}

function find(directory, pattern) {

    return new Promise(function (resolve, reject) {

        if (!exists(directory) || !isDirectory(directory)) reject('Directory not exists or not is a directory.')

        let result = []
        const regpattern = new RegExp(pattern, 'i')

        let it = subdirectory(directory)

        while (it.name) {

            if (regpattern.test(it.path)) {                
                result.push({path: it.path, size: it.stat().size, date: it.stat().mtime})
            }

            it = it.next()
        }

        resolve(result)
    })
}

function move(oldPath, newPath) {
    return new Promise(async (resolve, reject) => {
        
        try {
            await fsAsync.rename(oldPath, newPath)
            resolve()
        } catch(err) {
            if (err.errno === -18) {
                try {
                    await fsAsync.copyFile(oldPath, newPath)
                    await fsAsync.unlink(oldPath)
                    resolve()
                } catch(e) {
                    reject(e.code)
                }
            } else
                return new Promise((resolve, reject) => {reject(err.code)})
        }
    })
}

function changeTimes(pathFile, mtime, atime) {
    return fsAsync.utimes(pathFile, new Date(atime || 0), new Date(mtime || 0 ))
}

module.exports = {
    list,
    recursiveDirectorySync,
    existsEntry,
    existsFile,
    subDirContent,
    makeDirectory,
    removeFile,
    crc,
    hash,
    count,
    countWithUpdates,
    find,
    move,
    changeTimes,
    fileInfo: fileStat,
}
