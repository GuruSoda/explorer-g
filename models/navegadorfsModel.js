const EventEmitter = require('events')
const fs = require('fs')
const path = require('path')
const querystring = require('querystring')
const crc = require('crc')
const crypto = require('crypto');
let base = '/'

module.exports = {
    getDirBase: getDirBase,
    setDirBase: setDirBase,
    fullPath: fullPath,
    isDirectory: isDirectory,
    isFile: isFile,
    exists: exists,
    dirContent: dirContent,
    sizeSubDirectory: sizeSubDirectory,
    contentDirectory: contentDirectory,
    filesSubDirectories: filesSubDirectories,
    find: find,
    crc: getCRC,
    hash: getHash
}

module.exports.mensaje = function () {
    return 'Siempre seremos profugos!'
}

function getDirBase () {
    return msg
}

/////////////////////////////////
// base es sin la barra final
function setDirBase(rootDir) {

    base = rootDir.trim()

    if (base.charAt(base.length-1) === path.sep) {
        base = base.slice(0, -1)
    }
}

function fullPath(pathReq) {
    return querystring.unescape(path.join(base, pathReq))
}

function isDirectory(pathReq) {
    const file = querystring.unescape(path.join(base, pathReq))

    try {
        const stat = fs.lstatSync(file, {bigint: false, throwIfNoEntry: true})
        return stat.isDirectory()
    } catch (e) {
//        console.log(e)
        return false
    }
}

function getCRC(pathReq, algorithm='crc32') {
    const file = querystring.unescape(path.join(base, pathReq))

    return new Promise(function (resolve, reject) {
        const readStream = fs.createReadStream(file, {highWaterMark: 64*1024, enconding: 'binary'});
        let result = undefined

        readStream.on('data', (chunk) => {
            switch(algorithm) {
                case 'crc32': result = crc.crc32(chunk, result); break;
                case 'crc16': result = crc.crc16(chunk, result); break;
                case 'crc8': result = crc.crc8(chunk, result); break;
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
function getHash(pathReq, algorithm='md5') {
    const file = querystring.unescape(path.join(base, pathReq))

    return new Promise(function (resolve, reject) {

        const readStream = fs.createReadStream(file, {highWaterMark: 64*1024, enconding: 'binary'});
        const hash = crypto.createHash(algorithm);

        readStream.on('data', (chunk) => {
            hash.update(chunk);
        })

        readStream.on('end', () => {
            resolve(hash.digest('hex'))
        })

        readStream.on('error', (err) => {
            console.log(err)
            reject(err)
        })
    })
}

function exists(pathReq) {
    const file = querystring.unescape(path.join(base, pathReq))

    const stat = fs.lstatSync(file, {bigint: false, throwIfNoEntry: false})

    return stat ? true : false
}

function isFile (pathReq) {
    const file = querystring.unescape(path.join(base, pathReq))

    const stat = fs.lstatSync(file, {bigint: false, throwIfNoEntry: false})

    if (!stat) return false
    return stat.isFile() ? true : false
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
        stat = fs.lstatSync(absolutePath, {bigint: false})
        info = {
            name: path.posix.basename(absolutePath),
            size: stat.size,
            type: fileType(stat),
            modified: stat.mtime,
            access: stat.atime,
            change: stat.ctime,
            birth: stat.birthtime,
        }
    } catch (e) {
        info = {
            name: 'ERROR:' + path.posix.basename(absolutePath),
            size: 0,
            type: 'unknow',
            modified: 0,
            access: 0,
            change: 0,
            birth: 0,
        }
    }

    return info
}

function find(baseDirectory, pattern) {

    return new Promise(function (resolve, reject) {
        let result = []
        if (!exists(baseDirectory)) {
            reject({error: 'no such file or directory'})
        } else {
            const regpattern = new RegExp(pattern, 'i')

            filesSubDirectories (baseDirectory, function(fullPath) {
                if (regpattern.test(fullPath)) {
                    let reg = fileStat(fullPath)
                    reg.name = fullPath.substr(base.length)
                    result.push(reg)
                }
            }, {directories:false,files:true})

            resolve(result)
        }
    })
}

/*
{
    directories: false
    files: true
}
*/
function filesSubDirectories (directory, cb, options = {directories:false,files:true}) {
    let dir = querystring.unescape(path.join(base, directory))

    options.directories = options.directories ? true : false
    options.files = options.files ? true : false
    
    counterSizeDirectory(dir)

    function counterSizeDirectory(dir) {

        try {
            const listado = fs.readdirSync(dir, {withFileTypes: true})
    
            for (const file of listado) {
                let pathFile = path.join(dir, file.name)

                if (file.isDirectory()) {
                    if (options.directories) if (cb) cb(pathFile)
                    counterSizeDirectory(pathFile)
                } else if (file.isFile()) {
                    if (options.files) if (cb) cb(pathFile)
                } else {
                }
            }               
        } catch (e) {
//                console.log(e)
        }
    }
}

/*
class navFSEmitter extends EventEmitter {}

const fsEmit = new navFSEmitter();
*/
function contentDirectory (directory, cb, options) {
    let dir = querystring.unescape(path.join(base, directory))
    
    let eventos = new EventEmitter()

    eventos.on('search', function(directory) {
        dir = querystring.unescape(path.join(base, directory))

        console.log('Buscando:', dir)
        counterSizeDirectory(dir)

        function counterSizeDirectory(dir) {

            try {
                const listado = fs.readdirSync(dir, {withFileTypes: true})
        
                //for (const file of listado) {
                    listado.forEach(function(file) {
                    let pathFile = path.join(dir, file.name)
    
    //                if (cb) setImmediate(cb(pathFile))
                    console.log(pathFile)
                    eventos.emit('data', pathFile)
                    
                    if (file.isDirectory()) {
                        counterSizeDirectory(pathFile)
                    } else if (file.isFile()) {
                    } else {
                    }
                })
    
    //            if (cb) setImmediate(cb(''))
                
                eventos.emit('fin')
            } catch (e) {
//                console.log(e)
                eventos.emit('fin', e)
            }
        }
    })

    return eventos
}

function sizeSubDirectory (directory, cb, ms) {
        
    const dir = querystring.unescape(path.join(base, directory))

    if (!ms) ms = 750

    let infoDirectory = {
        sum: {
            totalFiles: 0,
            totalBytes: 0,
            totalDirectories: 0
        },
        current: {
            file: '',
            directory: ''
        }
    }

    try {

        let inicio = new Date()

        function counterSizeDirectory(dir) {

            try {
                const listado = fs.readdirSync(dir, {withFileTypes: true})

                for (const file of listado) {
                    let pathFile = path.join(dir, file.name)

                    let fin = new Date()
                    if ((fin.getTime() - inicio.getTime()) > ms ) {
                        if (cb) {
                            infoDirectory.current.directory = infoDirectory.current.directory.replace(base, '')
                            infoDirectory.current.file = infoDirectory.current.file.replace(base, '')
                            cb(infoDirectory)
                        }
                        inicio = new Date()
                    }

                    if (file.isDirectory()) {
                        infoDirectory.sum.totalDirectories++
                        infoDirectory.current.directory = pathFile
                        counterSizeDirectory(pathFile)
                    } else if (file.isFile()) {
                        const stat = fs.lstatSync(pathFile, {bigint: false, throwIfNoEntry: false})
                        infoDirectory.sum.totalBytes += stat.size
                        infoDirectory.sum.totalFiles++
                        infoDirectory.current.file = pathFile
                    }
                }
            } catch (e) {
                console.log('Error Procesando Directorio:', dir)
            }
        }

        counterSizeDirectory(dir)
    } catch (e) {
    }

    return infoDirectory
}

// Esta funcion retorna una promesa:
// resolve: vector de objetos donde cada posicion es un archivo o directorio del directorio a listar.
// reject: error en la busqueda
function dirContent (directory) {
        
    const dir = querystring.unescape(path.join(base, directory))

    console.log('dir:', dir)

    return new Promise(function (resolve, reject) {
        try {
            let contenido = []
            const listado = fs.readdirSync(dir, {withFileTypes: true})

            for (const file of listado) {
                let pathArchivo = path.join(dir, file.name)

                contenido.push(fileStat(pathArchivo))
            }

            resolve(contenido)
        } catch (e) {
            console.log('error-dirContent:', e)
            reject(e)
        }
    })
}
