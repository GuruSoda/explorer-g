const sqlite3 = require('sqlite3').verbose()

let db = undefined

function connect(filedb) {

    return new Promise ((resolve, reject) => {
        if (db == undefined) {
            db = new sqlite3.Database(filedb, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, function (err) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(db)
                    }
            })
        } else resolve(db)
    })
}

async function connectSync(filedb) {
    await connect(filedb)
}

function getdb() {
    return db
}

function close() {
     db.close(function (err) {
        if (err) return console.log('[close]:', err)
    })
}

module.exports = {
    connect,
    connectSync,
    close,
    getdb
}
