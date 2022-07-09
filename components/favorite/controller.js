const store = require('./store')

function createFavorite(name, description) {
    return new Promise((resolve, reject) => {
        if (!name) {
            reject('name is required.')
            return
        }

        store.create(name, description)
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

function deleteFavorite(name) {
    if (!name) return Promise.reject('name is required.')

    return new Promise((resolve, reject) => {
        store.delete(name)
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

function renameFavorite(oldname, newname) {
    if (!oldname || !newname) return Promise.reject('Invalid parameters (oldname or newname cannot be empty)')

    return new Promise((resolve, reject) => {
        store.rename(oldname, newname)
            .then(message => resolve(message))
            .catch(message => reject(message))

    })
}

function addToFavorite(name, file) {
    if (!name || !file) return Promise.reject('Invalid parameters (name or file cannot be empty)')

    return new Promise(async (resolve, reject) => {
        store.addTo(name, file)
            .then(message => resolve(message))
            .catch(message => reject(message))
    })
}

function deleteFromFavorite(name, file) {
    if (!name || !file) return Promise.reject('Invalid parameters (name or file cannot be empty)')

    return new Promise((resolve, reject) => {
            store.deleteFrom(name, file)
                .then(message => resolve(message))
                .catch(message => reject(message))
        })
}

function listFavorites() {
    return new Promise((resolve, reject) => {
        store.list()
            .then(message => {
                resolve(message)
            })
            .catch(err => {
                reject(err)
            })
    })
}

function listContent(name) {
    if (!name) return Promise.reject('Invalid parameters (name is empty)')

    return new Promise((resolve, reject) => {
        store.listContent(name)
            .then(message => {
                resolve(message)
            })
            .catch(err => {
                reject(err)
            })
    })
}

module.exports = {
    create: createFavorite,
    delete: deleteFavorite,
    rename: renameFavorite,
    addTo: addToFavorite,
    deleteFrom: deleteFromFavorite,
    list: listFavorites,
    listContent: listContent,
}
