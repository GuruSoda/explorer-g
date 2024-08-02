const navegador = "\
create table if not exists directory ( \
    id integer not null primary key autoincrement, \
    name text unique not null, \
    description text \
);\
create table if not exists file ( \
    id integer not null primary key autoincrement, \
    id_directory integer not null, \
    name text not null, \
    bytes integer not null, \
    date integer not null, \
    checksum text, \
    description text, \
    UNIQUE (id_directory, name), \
    FOREIGN KEY (id_directory) REFERENCES directory (id) on delete cascade \
)"

module.exports = navegador
