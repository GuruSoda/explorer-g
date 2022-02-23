const express = require('express');
const router = express.Router();
const navegador = require('../models/navegadorfsModel')

router.get('/sizedirectory/*', function (req, res) {

    let directory = req._parsedUrl.pathname.replace('/sizedirectory/', '')

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else 
        if (navegador.isDirectory(directory)) {

            let resDir = {}
            return new Promise(function (resolve, reject) {
                        resDir = navegador.sizeSubDirectory(directory, function(data) {
                            console.log(data.current.directory)
                        }, 1000)
                        resolve()
                    }).then(function() {
                        res.json(resDir.sum)
                    })
        } else if (navegador.isFile(directory)) {
            res.json({stat: 'sin estat por ahora.'});
        } else {
            res.json({error: 'Not is a file or directory.'})
        }
})

router.get('/search/*', function (req, res) {

    let directory = req._parsedUrl.pathname.replace('/search/', '')

    let search = req.query.s || ''

    navegador.find(directory, search).then(function(result){
        res.json(result)
    }).catch(function(err){
        res.json(err)
    })
})

router.get('/crc(8|16|32)/*', function (req, res) {

    let file, algorithm
    
    if (req._parsedUrl.pathname.startsWith('/crc32/')) {
        file=req._parsedUrl.pathname.replace('/crc32/', '')
        algorithm = 'crc32'
    } else if (req._parsedUrl.pathname.startsWith('/crc16/')) {
        file=req._parsedUrl.pathname.replace('/crc16/', '')
        algorithm = 'crc16'
    } else if (req._parsedUrl.pathname.startsWith('/crc8/')) {
        file=req._parsedUrl.pathname.replace('/crc8/', '')
        algorithm = 'crc8'
    } else
        res.sendStatus(404)

    if (!navegador.exists(file)) {
        res.json({error: 'no such file or directory'});
    } else {
        let inicioChecksum = new Date()

        navegador.crc(file, algorithm)
            .then((result) => res.json({crc32: result, timems: new Date() - inicioChecksum}))
            .catch((err) => res.json({error: err}))
    }
})

router.get('/hash-(md5|sha1|sha256|sha512)/*', function (req, res) {
    let file, algorithm
    
    if (req._parsedUrl.pathname.startsWith('/hash-md5/')) {
        file=req._parsedUrl.pathname.replace('/hash-md5/', '')
        algorithm = 'md5'
    } else if (req._parsedUrl.pathname.startsWith('/hash-sha1/')) {
        file=req._parsedUrl.pathname.replace('/hash-sha1/', '')
        algorithm = 'sha1'
    } else if (req._parsedUrl.pathname.startsWith('/hash-sha256/')) {
        file=req._parsedUrl.pathname.replace('/hash-sha256/', '')
        algorithm = 'sha256'
    } else
        res.sendStatus(404)

        if (!navegador.exists(file)) {
            res.json({error: 'no such file or directory'});
        } else {
            let inicioChecksum = new Date()
    
            navegador.hash(file, algorithm)
                .then((result) => res.json({hash: result, timems: new Date() - inicioChecksum}))
                .catch((err) => res.json({error: err}))
        }
})

router.get('/download/*', function (req, res) {

        file=req._parsedUrl.pathname.replace('/download/', '')

        if (!navegador.exists(file)) {
            res.json({error: 'no such file or directory'});
        } else if (navegador.isFile(file)) {
                res.download(navegador.fullPath(file))
        } else {
            res.json({error: 'Is not a file.'})
        }
})

router.get('/content/*', function (req, res) {

    let directory = req._parsedUrl.pathname.replace('/content/', '')

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else {
        let total=0
        new Promise(function (resolve, reject) {
            navegador.contentDirectory(directory, function(data) {
                console.log(data)
                total++
            })
            resolve()
        }).then(function() {
            res.json({total: total})
        })
    }
})

router.get('/event/*', function (req, res) {

    let directory = req._parsedUrl.pathname.replace('/event/', '')

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

router.get('/count/*', function (req, res) {

    let directory = req._parsedUrl.pathname.replace('/count/', '')

    if (!navegador.exists(directory)) {
        res.json({error: 'no such file or directory'});
    } else {
        let total=0
        return new Promise(function (resolve, reject) {
                        navegador.filesSubDirectories(directory, function(data) {
//                console.log(data)
                        total++
                    }, {files: true, directories: false})
                        resolve()
        }).then(function() {
            res.json({total: total})
        })
    }
})

module.exports = router;
