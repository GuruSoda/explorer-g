const dotenv = require('dotenv')

function loadConfig() {
//    console.log('Cargando configuracion...')
    dotenv.config()

    return {
        port: process.env.PORT || 65550,
        version: process.env.VERSION || '0.0.1',
        rootdir: process.env.ROOTDIR  || '/mnt/share',
        filedb: process.env.FILEDB  || ':memory:'
    }
}

const singletonConfig = (function () {

    let instance

    return {
        getInstance: function() {
            if (instance == null) {
                instance = loadConfig
            }

            return instance()
        }
    }
})()

module.exports = singletonConfig.getInstance()
