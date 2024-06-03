const Model = require('./model')
const subdirectory = require('files-in-directory')

// Model.run('PRAGMA journal_mode = WAL;')

function randonTableName(length=10) {
    let result      = '';
    const characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for ( let i = 0; i < length; i++ ) result += characters.charAt(Math.floor(Math.random() * characters.length))

    return result;
}

function init() {
    return new Promise((resolve, reject) => {
        Model.serialize(() => {
            Model.run('BEGIN TRANSACTION', (e) => {
                if (e)
                    reject('errno:' + e.errno + ' ' + 'code:' + e.code)
                else
                    resolve("Super-Re-Bien!")
            })
        })
    })
}

function end() {
    return new Promise((resolve, reject) => {
        Model.serialize(() => {
            Model.run('COMMIT TRANSACTION', (e) => {
                if (e)
                    reject('errno:' + e.errno + ' ' + 'code:' + e.code)
                else
                    resolve("Super-Re-Bien!")
            })
        })
    })
}

function addFile (dataFile) {
    return new Promise((resolve, reject) => {
        Model.serialize(() => {
            Model.run('insert or replace into file(file, bytes, date, checksum, description) values(?, ?, ?, ?, ?)', [dataFile.file, dataFile.bytes, dataFile.date, dataFile.checksum, dataFile.description], (e) => {
                if (e)
                    reject('errno:' + e.errno + ' ' + 'code:' + e.code)
                else
                    resolve("Super-Re-Bien!")
            })
        })
    })
}

function addDirectory (directory) {
    return new Promise((resolve, reject) => {

        Model.serialize(() => {
            const stmt = Model.prepare('insert into file(file, bytes, date, checksum, description) values(?, ?, ?, ?, ?)')

            let it = subdirectory(directory)

            while (it.name) {
                console.log('Encontrado:',it.path)

                const dataFile = {
                    file: it.path,
                    bytes: it.stat().size,
                    date: it.stat().mtime
                }

                stmt.run([dataFile.file, dataFile.bytes, dataFile.date, dataFile.checksum, dataFile.description], (e) => {
                    if (e) {
                        console.log('Error insertando:', dataFile.file)
                        reject('errno:' + e.errno + ' ' + 'code:' + e.code)
                    }
                    else {
                        console.log('Insertado:', dataFile.file)
                    }
                })

                it = it.next()
            }

            stmt.finalize();
            resolve()
        })
    })
}

function infoFile(file) {
    return new Promise((resolve, reject) => {
        Model.serialize(() => {
             Model.get('select id, file, bytes, date, checksum, description from file where file = ?', file, (err, row) => {
                if (err)
                    reject({errno: err.errno, code: err.code})
                else if (row)
                    resolve({id: row.id, file: row.file, size: row.bytes, date: new Date(row.date), checksum: row.checksum ? row.checksum : '', description: row.description ? row.description : ''})
                else 
                    reject({id: -1, file: file})
            })
        })
    })
}

function listFiles (dataFile) {
    return new Promise((resolve, reject) => {
        Model.all('select * from file limit 100', (err, rows) => {
            if (err) 
                reject (err)
            else 
                resolve(rows.map(record => { return {id: record.id, file: record.file, size: record.bytes, date: new Date(record.date).toLocaleString('es-AR')}}))
        })
    })
}

function countFiles (dataFile) {
    return new Promise((resolve, reject) => {
        Model.all('select count(id) as total from file', (err, rows) => {
            if (err) reject (err)
            else resolve(rows[0].total)
        })
    })
}

function countByExtension (directory) {
    return new Promise((resolve, reject) => {
        let lengthdirectory = directory.length
        Model.all('\
        select substr(lower(file), -4) as ext, count(id) as total \
        from file \
        where substr(file, 1, ?) = ? \
        GROUP by ext \
        HAVING substr(ext, 1, 1) = "." \
        ORDER by total DESC', [lengthdirectory, directory], (err, row) => {
            if (err) reject (err)
            else resolve(row)
        })
    })
}

function directorySize (directory) {
    return new Promise((resolve, reject) => {
        let lengthdirectory = directory.length
        Model.get('\
        select sum(bytes) as size \
        from file \
        where substr(file, 1, ?) = ?', [lengthdirectory, directory], (err, row) => {
            if (err) reject (err)
            else {
                row.size ? resolve(row.size) : resolve(-1)
            }
        })
    })
}

function equalsByChecksum (path) {
    return new Promise((resolve, reject) => {

        Model.serialize(() => {
            let tableName = randonTableName()
            let lastChecksum = ""
            let iguales = []
            let result = []

            Model.run(`CREATE TEMPORARY table ${tableName} as 
                        select checksum, count(id) as cant
                        from file
                        GROUP by checksum
                        HAVING cant > 1 ${ (path) ? "and substr(file, 1," + path.length + ") == \"" + path + "\"": ''}
                        ORDER by cant DESC`)
                .each(`SELECT id, file, bytes, date, checksum
                        from file
                        where checksum in (select checksum from ${tableName})
                        ${ (path) ? "and substr(file, 1," + path.length + ") == \"" + path + "\"": ''}                        
                        ORDER by checksum ASC`, (err, row) => {

                            let record = {id: row.id, file: row.file, size: row.bytes, date: new Date(row.date), checksum: row.checksum}

                            if (lastChecksum === row.checksum) iguales.push({...record})
                            else {
                                    if (iguales.length) result.push([...iguales])

                                    iguales.length = 0
                                    lastChecksum = row.checksum
                                    iguales.push({...record})
                            }
                        }, (err, numRows) => {
                            if (iguales.length) {
                                result.push([...iguales])
                            }
                    })
                .run(`DROP TABLE ${tableName}`, err => {
                    if (err) console.log(err)

                    resolve(result)
                })
          });
    })
}

function equalsByChecksumBorrar (path) {
    return new Promise((resolve, reject) => {
        let total=0
        Model.serialize(() => {
            // const stmt = Model.prepare("\
            // select id,file, bytes, date \
            // from file \
            // where checksum = ?")

            let result = []
            let checksums = []

            Model.each(`\
                select file, checksum, count(id) as total, sum(bytes) as tamanio \
                from file \
                GROUP by checksum \
                HAVING total > 1 ${ (path) ? "and substr(file, 1," + path.length + ") == \"" + path + "\"": ''} \
                ORDER by tamanio DESC`, (err, row) => {

                    if (err) reject('errno:' + err.errno + ' ' + 'code:' + err.code)

                    checksums.push(row.checksum)

            }, (err, numRows) => {

                Model.serialize(() => {
                    for (let i = 0;i<checksums.length;i++) {
                        
                            Model.all("\
                                select id,file, bytes, date \
                                from file \
                                where checksum = ?", checksums[i], (err, row) => {
                                    if (err) reject('errno:' + err.errno + ' ' + 'code:' + err.code)
                
                                    console.log('checksum:', total++, ' - ', row[0].id)
                                    result.push(row.map(record => { return { id: record.id, file: record.file, size: record.bytes, date: record.date}}))
                                })
                    }
                })

                console.log('fin!')
                if (err) 
                    console.log(err)
                else
                    console.log('total: ', numRows, ' === ', result.length)

                resolve(result)
            })
        })
    })
}

module.exports = {
    add: addFile,
    addDirectory: addDirectory,
    infoFile: infoFile,
    list: listFiles,
    count: countFiles,
    init,
    end,
    equalsByChecksum,
    directorySize,
    countByExtension
}
