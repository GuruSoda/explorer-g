const express = require('express')
const router = express.Router()
const controller = require('./controller')
const response = require('../../network/response')

router.post('/add', function(req, res) {

    const dataFile = {
        file: req.body.file,
        bytes: req.body.bytes,
        date: req.body.date,
        checksum: req.body.checksum,
        description: req.body.description
    }

    controller.add(dataFile)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error agregando archivo', 500, e)
        })
})

router.post('/directory', async function(req, res) {
    controller.addDirectory(req.body.directory)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error agregando directorio', 500, e)
        })
})

router.get('/count', async function(req, res) {
    controller.count()
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error contando files', 500, e)
        })
});


module.exports = router
