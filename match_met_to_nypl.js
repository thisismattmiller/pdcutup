const cluster = require('cluster')
const _ = require('highland')
const fs = require('fs')

var files = ['data/pd_items_3.ndjson']



if (cluster.isMaster) {

	var allItems = []
  var allItemsProcessed = []
	var counter = 0
  // var workers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  var workers = [1,2,3,4,5,6,7,8,9,10]
  // var workers = [1,2,3,4]

  console.time("master")

	console.log("hiii")
	_(files.map((file) => _(fs.createReadStream(file))))
	  .merge()
	  .split()
	  .map((d) =>{
	  	try{
	  		d = JSON.parse(d)
	  	}catch (e){
	  		return ''
	  	}
	  	allItems.push(d)
	  	return d
	  })
	  .compact()
	  .done(()=>{

	  	console.log(allItems.length)
      workers.forEach(() =>{
        var worker = cluster.fork()
        worker.on('message', function (msg) {
          if (msg.request) {
            worker.send({ work: allItems.shift() })
          }
          if (msg.result) {
            allItemsProcessed.push(msg.result)
            process.stdout.write(allItems.length + '\r')

            // write it out every 1000 and when we are done
            if (allItems.length % 1000 === 0 && allItems.length!==0){
              var output = fs.createWriteStream('data/nypl_met_matches_3.json')
              output.end(JSON.stringify(allItemsProcessed, null, 2))
            }


            if (allItems.length===0 && Object.keys(cluster.workers).length === 1){
              console.log("Okay all done going to write out a file naow")
              var output = fs.createWriteStream('data/nypl_met_matches_3.json')
              output.end(JSON.stringify(allItemsProcessed, null, 2))
              console.timeEnd("master")
            }
          }
        })
      })
	  })
}else{

  const levenshtein = require('fast-levenshtein')


  // load the met data
  var metObjs = fs.readFileSync('data/met_title_lookup.json', 'utf8');
  metObjs = JSON.parse(metObjs)

  var metTitles = Object.keys(metObjs)


  console.log("worker hiii")
  process.on('message', (msg) => {
    if (msg.work){
      var lowest = 30
      var lowestTitle = null
      metTitles.forEach((metTitle) => {
        if (!msg.work.title || !metTitle) return
        var result = levenshtein.get(msg.work.title,metTitle)
        if (result < lowest) {
         lowest = result
         lowestTitle = metTitle
        }
      })
      if (lowestTitle){
        console.log(lowest, lowestTitle, msg.work.title)
      }
      process.send({ result: {lowestScore:lowest, lowestTitle:lowestTitle, nyplTitle: msg.work.title, nyplUUID: msg.work.UUID, nyplCaptures: msg.work.captures}}, () =>{
        process.send({ request: true })
      })
    }else{
      process.exit(0)
    }
  })
  process.send({ request: true })
}