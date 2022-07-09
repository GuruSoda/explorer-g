const express = require('express')
const router = express.Router()
const controller = require('./controller')
const response = require('../../network/response')
const fileUpload = require('express-fileupload');

router.use(fileUpload({
    createParentPath: true,
    uriDecodeFileNames: true,
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: 'tmp-upload',
    debug: false,
    limits: { fileSize: 1024 * 1024 * 1024 * 50 } // 50 Gigas
}))

router.get('/list', function(req, res) {
    controller.list(req.query.directory)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error listando directorio', 500, e)
        })
})

router.get('/exists', function (req, res){
    controller.exists(req.query.file)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.get('/verify', function (req, res){
    controller.verify(req.query.file, req.query.size, req.query.date)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 404, e)
        })
})

router.post('/mkdir', function (req, res){
    controller.mkdir(req.body.newdirectory)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.delete('/rm', function (req, res){
    controller.rm(req.query.file)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.get('/crc', function(req, res) {
    controller.crc(req.query.file, req.query.algo)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error generando CRC', 500, e)
        })
})

router.get('/hash', function(req, res) {
    controller.hash(req.query.file, req.query.algo)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error generando hash', 500, e)
        })
})

router.get('/count', function(req, res) {
    controller.count(req.query.directory)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.get('/countsse', async function (req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      })

    function sentEvent(data) {
        res.write('event: Processing\n')
        res.write('data:' + JSON.stringify(data) + "\n\n")
    }

    const resultado = await controller.countWithUpdates(req.query.directory, function(data) {
                 sentEvent(data)
            }, req.query.updatems)
        
    res.write('event: close\n')
    delete resultado.current
    res.write('data:' + JSON.stringify(resultado) + '\n\n')
})

router.get('/find', function(req, res) {
    controller.find(req.query.directory, req.query.pattern)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.post('/upload', function (req, res) {

    let params = {
        fileName: req.files.file.name,
        fileDate: req.body.date,
        dirDestination: req.body.destination,
        tempFile: req.files.file.tempFilePath
    }

    controller.singleUpload(params)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.get('/download', function (req, res) {
    controller.download(req.query.file)
        .then(file => {
            res.download(file)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

router.get('/view', function (req, res) {
    controller.download(req.query.file)
        .then(file => {
            res.sendFile(file)
        })
        .catch(e => {
            response.error(req, res, e, 500, e)
        })
})

module.exports = router
