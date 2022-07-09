const db = require('../../db').getdb()

// Favorito:
// Que se estima o considera con preferencia entre otros de la misma especie.

const favorite = '\
CREATE TABLE if not exists favorite ( \
    id integer not null primary key autoincrement, \
    name text unique not null collate nocase, \
    description text \
)'

const foreign_keys = "PRAGMA foreign_keys = ON;"

const contentFavorite = '\
CREATE TABLE if not exists contentfavorite ( \
    id integer not null primary key autoincrement, \
    file text not null, \
    favorite_id integer not null, \
    UNIQUE(file, favorite_id), \
    FOREIGN KEY (favorite_id) REFERENCES favorite (id) on delete cascade \
)'

db.serialize(() => {
    db
    .run(foreign_keys)
    .run(favorite, (e) => {
        if (e) console.log('Error creando favorite:', e)
        else console.log('favorite ok')
    })
    .run(contentFavorite, (e) => {
        if (e) console.log('Error creando contentFavorite:', e)
        else console.log('contentFavorite ok')
    })
})

module.exports = db
