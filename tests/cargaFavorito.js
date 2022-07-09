const config = require('../config')
const db = require('../db')

db.connect(config.filedb)

const controller = require('../components/favorite/controller')

async function main () {

    await controller.create('Musica', 'ho ho ho')
    await controller.addTo('Musica', 'sobredosis.tv.mp3')
    await controller.addTo('Musica', 'profugos.mp3')
    await controller.addTo('Musica', 'cupula.mp3')

    await controller.create('Pelis')
    await controller.addTo('Pelis', 'volver1.mp4')
    await controller.addTo('Pelis', 'volver2.mp4')
    await controller.addTo('Pelis', 'volver3.mp4')

    await controller.create('borrar', 'archivos para borrar')

    db.close()
}

main ()
