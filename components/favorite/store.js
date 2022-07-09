const Model = require('./model')

const errorMessages = {
    '19': 'File Exists.'
}

function createFavorite(name, description) {
    return new Promise((resolve, reject) => {
        Model.run('insert into favorite(name, description) values(?, ?)', [name, description], (e) => {            
            if (e) reject('errno:' + e.errno + ' ' + 'code:' + e.code)
            else resolve('Super-Bien!')
        })
    })
}

function favorite(name) {
    return new Promise((resolve, reject) => {
        Model.all('select * from favorite where name = ?', [name], (err, rows) => {
            if (e) reject('[deleteFavorite]: errno:' + e.errno + ' ' + 'code:' + e.code)
            else resolve(rows[0])
        })
    })
}

function deleteFavorite(name) {
    return new Promise(async (resolve, reject) => {
        Model.run('delete from favorite where name = ?', [name], (e) => {
            if (e) reject('[deleteFavorite]: errno:' + e.errno + ' ' + 'code:' + e.code)
            else resolve('Super-Bien!')
        })
    })
}

function renameFavorite(oldname, newname) {
    return new Promise(async (resolve, reject) => {
        Model.run('update favorite set name = ? where name = ?', [newname, oldname], (e) => {
            if (e) reject('[renameFavorite]: errno:' + e.errno + ' ' + 'code:' + e.code)
            else resolve('Super-Bien!')
        })
    })
}

function addToFavorite(name, file) {
    return new Promise(async (resolve, reject) => {
        const favoriteid = await favorite(name)

        if (!favoriteid) { reject('Favorito ' + name +' no existe.'); return }

        Model.run('insert into contentfavorite(file, favorite_id) values(?, ?)', [file, favoriteid.id], (e) => {
            if (e) reject('[addToFavorite]: errno:' + e.errno + ' ' + 'code:' + e.code)
            else resolve('Super-Bien!')
        })
    })
}

function deleteFromFavorite(name, file) {
    return new Promise(async (resolve, reject) => {
        const favoriteid = await favorite(name)

        if (!favoriteid) { reject('Favorito ' + name +' no existe.'); return }

        Model.run('delete from contentfavorite where file = ? and favorite_id = ?', [file, favoriteid.id], (e) => {
            if (e) reject('[deleteFromFavorite]: errno:' + e.errno + ' ' + 'code:' + e.code)
            else resolve('Super-Bien!')
        })
    })
}

function listFavorites() {
    return new Promise((resolve, reject) => {
        Model.all('select name,description from favorite', [], (err, rows) => {
            if (err) reject (err)
            else resolve(rows.map(record => {return {name: record.name, description: record.description||''}}))
        })
    })
}

function listContent(name) {
    return new Promise(async (resolve, reject) => {
        const regfav = await favorite(name)

        if (!regfav) { reject('Favorito ' + name +' no existe.'); return }

        Model.all('select * from contentfavorite where favorite_id = ?', [regfav.id], (err, rows) => {
            if (err) reject (err)
            else resolve(rows.map(record => record.file))
        })
    })
}

module.exports = {
    favorite,
    create: createFavorite,
    delete: deleteFavorite,
    rename: renameFavorite,
    addTo: addToFavorite,
    deleteFrom: deleteFromFavorite,
    list: listFavorites,
    listContent,
}
