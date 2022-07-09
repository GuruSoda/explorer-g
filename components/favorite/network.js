const express = require('express')
const router = express.Router()
const controller = require('./controller')
const response = require('../../network/response')

router.post('/create', function(req, res) {
    controller.create(req.body.name, req.body.description)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error creado favorito', 500, e)
        })
});

router.delete('/delete', function(req, res) {
    controller.delete(req.body.name)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error deleting favorite.', 500, e)
        })
});

router.patch('/rename', function(req, res) {
    controller.rename(req.body.oldname, req.body.newname)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error deleting favorite.', 500, e)
        })
});

router.post('/addto', function(req, res) {
    controller.addTo(req.body.name, req.body.file)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error inserting file.', 500, e)
        })
});

router.delete('/deletefrom', function(req, res) {
    controller.deleteFrom(req.body.name, req.body.file)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch(e => {
            response.error(req, res, 'Error deleting file.', 500, e)
        })
});

router.get('/list', function(req, res) {
    controller.list()
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch((message) => {
            response.error(req, res, message, 500, message)
        })
});

router.get('/listcontent', function(req, res) {
    controller.listContent(req.query.name)
        .then((message) => {
            response.success(req, res, message, 200)
        })
        .catch((message) => {
            response.error(req, res, message, 500, message)
        })
});

module.exports = router
