var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Db = require('tingodb')().Db;
var tungus = require('tungus')

console.log(global.MONGOOSE_DRIVER_PATH)

global.TUNGUS_DB_OPTIONS =  { nativeObjectID: true, searchInArray: true };

var fileSchema = new Schema({
	name: String,
    size: Number,
    modified: Date,
    path: String
})

var file = mongoose.model('File', fileSchema)

async function main() {

    var db = new Db('db', {});
    await mongoose.connect('tingodb://db')

    createData()

/*
    await mongoose.connect('tingodb://'+__dirname+'/data', function (err) {
        // if we failed to connect, abort
        if (err) throw err;
      
        // we connected ok
        createData()
      })
  */    
}

function createData() {
    file.create({
        name: 'Nintendo 64-all-games.zip',
        size: 1009,
        modified: 'September 29, 1996',
        path: '/mnt/Juegos/Consolad/Nintendo64'
    })
}

main()
