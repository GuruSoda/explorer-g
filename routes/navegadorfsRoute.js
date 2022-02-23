const express = require('express');
const router = express.Router();
const navegador = require('../models/navegadorfsModel')
/*
const rootDir = process.env.ROOTDIR || '/'

navegador.setDirBase(rootDir)
*/
router.use(function (req, res, next) {

  console.log(req.url)

  if (navegador.isDirectory(req.url)) {
      navegador.dirContent(req.url).then(function(data) {
        res.json(data);
      })
      .catch(function(data) {
        res.json({error: data});
      })
  } else if (navegador.isFile(req.url)) {
    res.sendFile(navegador.fullPath(req.url))
  } else {
    res.json({error: 'file type not supported for download.'})
  }
})

module.exports = router;
