const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const navegador = require('./models/navegadorfsModel')

const indexNavegador = require('./routes/navegadorfsRoute')
const indexNavTools = require('./routes/navfstoolsRoute')

const app = express()

navegador.setDirBase(process.env.ROOTDIR || '/mnt/share')

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'client/build')))
// app.use('/',express.static(path.join(__dirname, 'public')))
// app.use('/test/',express.static(path.join(__dirname, 'public')))
// Para el cliente en react
// app.use(express.static(path.resolve(__dirname, '../client/build')))

app.use('/navegador', indexNavegador)
app.use('/navtools', indexNavTools)

module.exports = app
