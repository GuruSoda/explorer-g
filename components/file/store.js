const Model = require('./model')
const navegador = require('../../models/navegadorfsModel')

async function addFile (dataFile) {
    return new Promise(async (resolve, reject) => {
        await Model.serialize(() => {
            Model.run('insert into file(file, bytes, date, checksum, description) values(?, ?, ?, ?, ?)', [dataFile.file, dataFile.bytes, dataFile.date, dataFile.checksum, dataFile.description], (e) => {
                e ? reject('errno:' + e.errno + ' ' + 'code:' + e.code) : resolve('Super-Bien!')
            })
        })
    })
}

function addDirectory (directory) {
    return new Promise(async (resolve, reject) => {

        Model.serialize(() => {
            const stmt = Model.prepare('insert into file(file, bytes, date, checksum, description) values(?, ?, ?, ?, ?)')

            navegador.filesSubDirectories (directory, async function(filePath) {

                console.log('Encontrado:',filePath)

                const file = navegador.stat(filePath);

                const dataFile = {
                    file: filePath,
                    bytes: file.size,
                    date: file.modified
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
            }, {directories:false, files: true})

            stmt.finalize();
            resolve()
        });
    })
}

function listFiles (dataFile) {
    return new Promise((resolve, reject) => {
        Model.all('select * from file', (err, rows) => {
            if (err) 
                reject (err)
            else 
                resolve(rows.map(record => { return {id: record.id, file: record.file, bytes: record.bytes, date: new Date(record.date).toLocaleString('es-AR')}}))
        })
    })
}

function countFiles (dataFile) {
    return new Promise((resolve, reject) => {
        Model.all('select count(id) as total from file', (err, rows) => {
            console.log(rows)
            if (err) reject (err)
            else resolve(rows[0].total)
        })
    })
}

module.exports = {
    add: addFile,
    addDirectory: addDirectory,
    list: listFiles,
    count: countFiles
}
