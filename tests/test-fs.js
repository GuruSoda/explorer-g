const config = require('../config')

const controller = require('../components/fileSystem/controller')

async function main() {
    try {
        const salida = await controller.listDirectory('/mnt/Cosas/')

        console.log('ok:', salida)
    } catch(e) {
        console.log('mal:', e)
    }
}

main()
