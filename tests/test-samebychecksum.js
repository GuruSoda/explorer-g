const config = require('../config')
const db = require('../db')

db.connect(config.filedb)

const controller = require('../components/file/controller')

async function main() {
    controller.init()
    try {
        const iguales = await controller.equalsByChecksum('/Chicas/Paginas/iporntv.net/')

        console.log(iguales)
//        console.log('repetidos:',iguales.length)
    } catch(e) {
        console.log('mal:', e)
    }

    controller.end()

    console.log('Cerrando...')
    db.close()
}

main()
