const db = require('../../db').getdb()

const stmtCreate = "\
create table if not exists entry ( \
    id integer not null primary key autoincrement, \
    id_directory text not null, \
    file text not null, \
    bytes integer not null, \
    date integer not null, \
    checksum text, \
    description text, \
    UNIQUE (id_directory, file), \
    FOREIGN KEY (id_directory) REFERENCES directory (id) on delete cascade \
);\
create table if not exists directory ( \
    id integer not null primary key autoincrement collate, \
    directory text not null, \
    description text \
)"

function ejecutar() {
     return new Promise((resolve, reject) => {
             db.run(stmtCreate, (e) => {
                 if (e) {
                     reject(e)
                 } else {
                     resolve('ok')
                 }
             })
     })
}

// ejecutar()
(async () => await ejecutar())()

// async function ejecutar() {
//     return new Promise((resolve, reject) => {
//             db.run(file, (e) => {
//                 if (e) {
//                     reject(e)
//                 } else {
//                     resolve('ok')
//                 }
//             })
//     })

// }

// (async () => console.log(await ejecutar()))()

module.exports = db
