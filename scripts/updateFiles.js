const config = require('../config')
const db = require('../db')
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'database', alias: 'b', type: String, defaultValue: config.filedb },
    { name: 'checksum', alias: 'c', type: Boolean, defaultValue: false },
    { name: 'directory', alias: 'd', type: String, defaultValue: config.rootdir }
  ]

const options = commandLineArgs(optionDefinitions)

config.filedb = options.database
config.rootdir = options.directory

db.connect(options.database)

const serviceFileSystem = require('../components/fileSystem/service')
const controllerFile = require('../components/file/controller')
const subdirectory = require('files-in-directory')
const { directorySize } = require('../components/file/store')

async function main () {

    let it = subdirectory(options.directory)
    let dir_actual = ""

//    if (!options.checksum) 
    await controllerFile.init()

//    console.log('Iniciando...')

    while (it.name) {

//        if (it.dep === 2) console.log('path:', it.path)

        if (dir_actual.localeCompare(it.directory) != 0) {
//            console.log('fin transaction... ', dir_actual)
            await controllerFile.end()
            dir_actual = it.directory
//            console.log('start transaction... ', dir_actual)
            await controllerFile.init()
        }

//        controllerFile.init()

        let dataFile = {}

//        console.log('name:', it.path)
        dataFile.file =  it.path
        dataFile.bytes =  it.stat().size
        dataFile.date =  it.stat().mtime

        try {
            let infoFileDB = await controllerFile.info(controllerFile.relativePath(it.path))

            // console.log('date db:', infoFileDB.date.getTime())
            // console.log('date fs:', it.stat().mtime.getTime())

            // console.log('size db:', infoFileDB.size)
            // console.log('size fs:', it.stat().size)

            if (infoFileDB.size !== it.stat().size || infoFileDB.date.getTime() !== it.stat().mtime.getTime() || (!infoFileDB.checksum && options.checksum)) {
                console.log('Updating:', it.path)

                if (options.checksum) {
                    try {
                        dataFile.checksum = await serviceFileSystem.hash(it.path)
                    } catch (err) {
                        dataFile.checksum = '00000000000000000000000000000000'
                    }
                }

                await controllerFile.add(dataFile)
            }
        } catch (err) {
            if (err.id === -1 ) {
                console.log('Adding ', err.file)

                if (options.checksum) {
                    try {
                        dataFile.checksum = await serviceFileSystem.hash(it.path)
                    } catch (err) {
                        dataFile.checksum = '00000000000000000000000000000000'
                    }
                }

              await controllerFile.add(dataFile)

            } else if (err.errno) console.log('errno:', err)
            else console.log('Error Desconocido:', err)
        }

  //      controllerFile.end()
        it = it.next()
    }

//    if (!options.checksum) 
    controllerFile.end()
    db.close()
}

main ()
