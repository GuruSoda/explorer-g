const config = require('../config')
const db = require('../db')
db.connect(config.filedb)
const fileSystem = require('../components/fileSystem/service')
const controller = require('../components/file/controller')
const subdirectory = require('files-in-directory')

async function main () {

    let it = subdirectory('/mnt/Chicas/')

    while (it.name) {

        try {
            let salida = await controller.info(it.path)

            if (!salida.checksum) {

                const dataFile = {
                    file: it.path,
                    bytes: it.stat().size,
                    date: it.stat().mtime,
                    checksum: await fileSystem.hash(it.path)
                }
        
                salida = await controller.add(dataFile)
        
                console.log('updated:', it.path)
            }
        } catch (err) {
            console.log('Error:', err)
        }

        it = it.next()
    }

    db.close()
}

main ()
