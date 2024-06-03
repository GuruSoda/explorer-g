const config = require('../config')
const db = require('../db')

db.connect(config.filedb)

const controller = require('../components/file/controller')

async function main() {
    try {
        data = {
            file: "profugos.exe",
            bytes: 65535,
            date: 09012022152123,
            checksum: "abcdef",
            description: "Aguante Soda!"
        }

        controller.init()

        for (let i=0;i<1000;i++) {
            data.file = "Numero" + i
            let salida = await controller.add(data)
            console.log('ok:', i)
        }

        controller.end()

        await controller.list()
            .then(data => console.log(data))
    } catch(e) {
        console.log('mal:', e)
    }
}

main()
