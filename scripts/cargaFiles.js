const config = require('../config')
const db = require('../db')
const navegador = require('../models/navegadorfsModel')

async function main () {

    await db.connectSync(config.filedb)

    const controller = require('../components/file/controller')


    // const listado = await navegador.dirContent('/mnt/Musica/Variado/')

    // for (const file of listado) {

    //     const dataFile = {
    //         file: file.name,
    //         bytes: file.size,
    //         date: file.modified
    //     }

    //     controller.add(dataFile)
    // }

    navegador.filesSubDirectories ('/mnt/Musica/Variado/', async function(filePath) {

        console.log(filePath)

        const file = navegador.stat(filePath);

        const dataFile = {
            file: filePath,
            bytes: file.size,
            date: file.modified
        }

        await controller.add(dataFile)

    }, {directories:true})

    console.log('Cerrando...')
    db.close()
}

main ()
