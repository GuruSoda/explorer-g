const config = require('../config')
const db = require('../db')
db.connect(config.filedb)
const fileSystem = require('../components/fileSystem/service')
const controller = require('../components/file/controller')
const subdirectory = require('files-in-directory')

async function main () {

    // const listado = await navegador.dirContent('/mnt/Musica/Variado/')

    // for (const file of listado) {

    //     const dataFile = {
    //         file: file.name,
    //         bytes: file.size,
    //         date: file.modified
    //     }

    //     controller.add(dataFile)
    // }


    // controller.init()

    // navegador.recursiveDirectorySync ('/mnt/Chicas/', async function(filePath) {

    //     const file = navegador.fileInfo(filePath);

    //     const dataFile = {
    //         file: filePath,
    //         bytes: file.size,
    //         date: file.modified
    //     }

    //     let salida = await controller.add(dataFile)
    //     console.log('Bien:', dataFile.file)

    // }, {directories:false, files:true})

    // controller.end()


    controller.init()

    let it = subdirectory('/mnt/Chicas/')

    while (it.name) {

        const dataFile = {
            file: it.path,
            bytes: it.stat().size,
            date: it.stat().mtime,
            checksum: await fileSystem.hash(it.path)
        }

        let salida = await controller.add(dataFile)
        console.log('Bien:', dataFile.file)

        it = it.next()
    }

    controller.end()

    console.log('Cerrando...')
    db.close()
}

main ()
