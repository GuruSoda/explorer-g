const express = require('express');
const router = express.Router();
const navegador = require('../models/navegadorfsModel')
const parseUrl = require('parseurl');
const path = require('path')
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

let total=0

router.get('/usagesse/*', async function (req, res) {

    let directory = req.params['0'] || '/'

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else 
        if (navegador.isDirectory(directory)) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache'
              })

            function sentEvent(data) {
                res.write('event: Processing\n')
                res.write('data:' + JSON.stringify(data) + "\n\n")
            }

            const resultado = await navegador.usage(directory, function(data) {
                sentEvent(data)
            }, 750)

            console.log(resultado.sum)

            res.write('event: close\n')
            delete resultado.current
            res.write('data:' + JSON.stringify(resultado) + '\n\n')
        } else if (navegador.isFile(directory)) {
            res.json({stat: 'sin estat por ahora.'});
        } else {
            res.json({error: 'Not is a file or directory.'})
        }
})

router.get('/usage/*', function (req, res) {

    let directory = req.params['0'] || '/'

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else {
        navegador.countDirFiles(directory).then(function(data){
            res.json(data)
        }).catch(function(err) {
            res.json(err)
        })
    }
})

router.get('/search/*', function (req, res) {

    let directory = req.params['0'] || '/'

    let search = req.query.s || ''

    navegador.find(directory, search).then(function(result){
        res.json(result)
    }).catch(function(err){
        res.json(err)
    })
})

router.get('/crc(8|16|32)/*/:file', function (req, res) {

    let file=req.params['1'] + '/' + req.params.file, algorithm
    
    if (req._parsedUrl.pathname.startsWith('/crc32/')) algorithm = 'crc32'
    else if (req._parsedUrl.pathname.startsWith('/crc16/')) algorithm = 'crc16'
    else if (req._parsedUrl.pathname.startsWith('/crc8/')) algorithm = 'crc8'
    else res.sendStatus(404)

    if (!navegador.exists(file)) {
        res.json({error: 'no such file or directory'});
    } else {
        let inicioChecksum = new Date()

        navegador.crc(file, algorithm)
            .then((result) => res.json({crc32: result, timems: new Date() - inicioChecksum}))
            .catch((err) => res.json({error: err}))
    }
})

router.get('/hash-(md5|sha1|sha256|sha512)/*/:file', function (req, res) {
    let file=req.params['1'] + '/' + req.params.file, algorithm
    
    if (req._parsedUrl.pathname.startsWith('/hash-md5/')) algorithm = 'md5'
    else if (req._parsedUrl.pathname.startsWith('/hash-sha1/')) algorithm = 'sha1'
    else if (req._parsedUrl.pathname.startsWith('/hash-sha256/')) algorithm = 'sha256'
    else res.sendStatus(404)

    if (!navegador.exists(file)) {
        res.json({error: 'no such file or directory'});
    } else {
        let inicioChecksum = new Date()

        navegador.hash(file, algorithm)
            .then((result) => res.json({hash: result, timems: new Date() - inicioChecksum}))
            .catch((err) => res.json({error: err}))
    }
})

router.get('/download/*/:file', function (req, res) {

        let fullPath = req.params['0'] + '/' + req.params.file

        if (!navegador.exists(fullPath)) {
            res.json({error: 'no such file or directory'});
        } else if (navegador.isFile(fullPath)) {
                res.download(navegador.fullPath(fullPath))
        } else {
            res.json({error: 'Is not a file.'})
        }
})

router.post('/upload/*', function (req, res) {

    let directory = req.params['0'] || '/'

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else {
//        res.json({error: 'todo bien!'});

        const destino = navegador.fullPath(path.join(directory, req.files.file.name))

        if (!navegador.exists(path.join(directory, req.files.file.name))) {
        
            req.files.file.mv(destino).then((data) => {
                    try {
                        navegador.changeTimes(path.join(directory, req.files.file.name), req.body.date, req.body.date)
                    } catch(e) {
                        console.log('changeTime Error:'. e)
                    }
    
                    res.json({body: 'ok'})
                    total++
//                    console.log('nro:', total, 'file:', destino)
                }).catch((data) => {
                    res.status(500).json({error: data})
            })
        } else {
            console.log('Ya Existe!', destino)

            req.files.file.mv('/dev/null').then((data) => {
                console.log('Borrando temporal', req.files.file.tempFilePath)
            })
            res.json({body: 'File Exist'})            
        }
    }
})

router.post('/mkdir/*', function (req, res){

    console.log(req.body.name)

    let directory = req.params['0'] || '/'

    console.log(directory)

    if (navegador.exists(directory)) {
        res.json({error: 'Directory Exists'});
    } else {
        try {
            navegador.makeDirectory()
            res.send({body: 'ok'})
        } catch (err) {
            res.json({error: err})
        }
    }
})

router.get('/content/*', function (req, res) {

    let directory = req.params['0'] || '/'

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else {
        let total=0
        new Promise(function (resolve, reject) {
            navegador.contentDirectory(directory, function(data) {
//                console.log(data)
                total++
            })
            resolve()
        }).then(function() {
            res.json({total: total})
        })
    }
})

router.get('/event/*', function (req, res) {

    let directory = req.params['0'] || '/'

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else {
            let total=0
            let evento = navegador.contentDirectory(directory)

            evento.emit('search', directory)

            evento.on('data', function (data) {
                console.log(data)
                total++
            })

            evento.on('fin', function(e) {
                console.log(e)
                res.json({fin: total})
            })
    }
})

module.exports = router;
