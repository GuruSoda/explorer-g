const db = require('../../db').getdb()

const file = '\
create table if not exists file ( \
    id integer not null primary key autoincrement, \
    file text not null, \
    bytes integer not null, \
    date integer not null, \
    checksum text, \
    description text, \
    UNIQUE(file, bytes, date) \
)'

async function ejecutar() {
    return new Promise((resolve, reject) => {
            db.run(file, (e) => {
                if (e) {
                    reject(e)
                } else {
                    resolve('ok')
                }
            })
    })

}

(async () => console.log(await ejecutar()))()

module.exports = db
