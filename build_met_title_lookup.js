const _ = require('highland')
const parse = require('csv-parse/lib')
const fs = require('fs')

var metObjs = {}
var counter = 0

var parseCSVRow = function(record,callback){
  parse(record, {comment: '#'}, function(err, output){
    if (!output) {
      callback(null,'')
      return false
    }
    output = output[0]
    // skip errors
    if (err) {
      callback(null,'')
      return false
    }
    // make sure there is a URL
    if (!output[40]) {
      callback(null,'')
      return false
    }
    // make sure it is a URL
    if (output[40].search('http')===-1) {
      callback(null,'')
      return false
    }
    callback(null,output)
  })
}

_(fs.createReadStream('data/met.csv'))
  .compact()
  .split()
  .map(_.curry(parseCSVRow))
  .nfcall([])
  .parallel(10)
  .compact()
  .map((d)=>{
    process.stdout.write(++counter + '\r')

    var objName = d[5]
    var title = d[6]
    var culture = d[7]
    var use = ''

    if (objName === title){
      use = `${culture} ${title}`.replace('probably','').replace('possibly','').trim()

    }else{
      use = title
    }

    if (!metObjs[use]){
      metObjs[use] = []
    }
    metObjs[use].push(d[40])
  })
  .done(()=>{
    var output = fs.createWriteStream('data/met_title_lookup.json')
    output.end(JSON.stringify(metObjs, null, 2))
  })


    // _(files.map((file) => _(fs.createReadStream(file))))
    //   .merge()