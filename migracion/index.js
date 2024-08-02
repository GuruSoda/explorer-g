const database = require('better-sqlite3')
const modeloNuevo = require('./modelo')
const path = require('path')

const root = '/mnt/Juegos'

//{ verbose: console.log }
const v2 = new database('juegos-v3.sqlite')
// v2.pragma('journal_mode = WAL')
v2.pragma('foreign_keys = ON')
v2.exec(modeloNuevo)
const v1 = new database('../databases/juegos.sqlite')

const insertDir = v2.prepare('insert or ignore into directory(name) values (?)')
const getDirId = v2.prepare('select id from directory where name == ?')
const insertFile = v2.prepare('insert or ignore into file(id_directory, name, bytes, date, checksum, description) values (?,?,?,?,?,?)')

let iterator = v1.prepare('select * from file').iterate()

let ultimo_dir = ""
for (const archivo of iterator) {

    const ruta = archivo.file.replace(root, "")

    const splitpath = path.parse(ruta)

    if (ultimo_dir !== splitpath.dir) {
        console.log(ultimo_dir)
        insertDir.run(splitpath.dir)
        ultimo_dir = splitpath.dir
    }
}

iterator = v1.prepare('select * from file').iterate()
for (const archivo of iterator) {
    const ruta = archivo.file.replace(root, "")

    const splitpath = path.parse(ruta)

    const id_directory = getDirId.get(splitpath.dir).id
    insertFile.run(id_directory, splitpath.base, archivo.bytes, archivo.date, archivo.checksum, archivo.description)
}

//    const id_directory = insertDir.run(splitpath.dir).lastInsertRowid
//    console.log('id_directory:', id_directory)
//    insertFile.run(id_directory, splitpath.base, archivo.bytes, archivo.date, archivo.checksum, archivo.description)

v1.close()
v2.close()
