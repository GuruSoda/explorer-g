const express = require('express');
const routes = express.Router();

const navegador = require('../routes/navegadorfsRoute')
const navtools = require('../routes/navfstoolsRoute')
const file = require('../components/file/network')
const fileSystem = require('../components/fileSystem/network')
const favorite = require('../components/favorite/network')

// routes.use('/navegador', navegador)
// routes.use('/navtools', navtools)
routes.use('/file', file)
routes.use('/fs', fileSystem)
routes.use('/favorite', favorite)

module.exports = routes
