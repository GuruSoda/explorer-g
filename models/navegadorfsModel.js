const EventEmitter = require('events')
const fs = require('fs')
const fsAsync = require('fs/promises')
const path = require('path')
const querystring = require('querystring')
const crc = require('crc')
const crypto = require('crypto');

let base = '/'

module.exports = {
    getDirBase: getDirBase,
    setDirBase: setDirBase,
    fullPath: fullPath,
    mkdir: makeDirectory,
    isDirectory: isDirectory,
    isFile: isFile,
    exists: exists,
    changeTimes: changeTimes,
    dirContent: dirContent,
    usage: usage,
    contentDirectory: contentDirectory,
    filesSubDirectories: filesSubDirectories,
    find: find,
    crc: getCRC,
    hash: getHash,
    countDirFiles: countDirFiles
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

async function changeTimes(pathFile, atime, mtime) {
    const file = querystring.unescape(path.join(base, pathFile))

    try {
        await fsAsync.utimes(file, new Date(atime) || new Date(0), new Date(mtime) || new Date(0))
    } catch (e) {
        throw (e)
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

async function makeDirectory(newDirectory) {
    const newPath = querystring.unescape(path.join(base, newDirectory))

    try {
        await fsAsync.mkdir(newPath);
    } catch (err) {
        throw err;
    }
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
Funcion que recorre a partir de un directorio "relativo" todos lo archivos y subdirectorios.
En las opciones se puede especificar y debe ejecutar el callback al encontrar un directorio o archivo o ambos.
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


/*
Funcion que cuenta la cantidad de archivos, directorios y el total de bytes que ocupan los archivos.
La sumatoria parcial y el lugar actual del recorrido es informado mediante el "cb" que se ejecuta cada "ms"
La funcion retorna el resultado final de contar directorios, archivos y cantidad de bytes de todos los archivos.
directory: Directorio "relativo" a partir de donde se cuentan los directorios y archivos.
cb: Callback que se va a llamar cada "ms" de milisegundos
ms: Milisegundos entre llamadas al "cb".
*/
async function usage (directory, cb, ms) {
        
    const dir = querystring.unescape(path.join(base, directory))

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
        
        async function counterSizeDirectory(dir) {

            try {
                const listado = await fsAsync.readdir(dir, {withFileTypes: true})

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
                console.log('Error Procesando Directorio:', dir, '(' + e + ')')
            }
        }

        await counterSizeDirectory(dir)

    } catch (e) {
    }

    return infoDirectory
}

// Funcion qeu retorna el contenido de un directorio "relativo"
// La funcion retorna una promesa:
// resolve: vector de objetos donde cada posicion es un archivo o directorio del directorio a listar.
// reject: error en la busqueda
function dirContent (directory) {
        
    const dir = querystring.unescape(path.join(base, directory))

    return new Promise(async function (resolve, reject) {
        try {
            let contenido = []
            const listado = await fsAsync.readdir(dir, {withFileTypes: true})

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

/*
Esta funcion cuenta la cantidad de archivos y subdirectorios a partir de un directorio "relativo"
retorna una promesa 
*/
function countDirFiles(directory) {

     return new Promise(function (resolve, reject) {
                let directories=0, files=0, size=0, errors=0

                filesSubDirectories(directory, function(data) {

                    try {
                        const stat = fs.lstatSync(data, {bigint: false, throwIfNoEntry: false})

                        if (stat.isFile()) {
                            files++
                            size += stat.size
                        } else if (stat.isDirectory()) directories++

                    } catch(err) {
                        errors++
                        console.log('En countDirFiles:', err)
                    }
                }, {files: true, directories: true})
                resolve({directories, files, size, errors})
        })
}
