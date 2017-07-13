const _ = require('highland')
const fs = require('fs')
const request = require('request')

var metObjs = fs.readFileSync('data/met_title_lookup.json', 'utf8');
metObjs = JSON.parse(metObjs)

var metNYPLMatches = fs.readFileSync('data/nypl_met_matches_3.json', 'utf8');
metNYPLMatches = JSON.parse(metNYPLMatches)


var outputDir = 'output3'

var downloadMetHTML = function (match, callback) {
  request(match.metWebURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      match.metWebURLHTML = body
      callback(null,match)
    }else{
      match.metWebURLHTML = false
      callback(null,match)
    }
  })
}

var downloadMetImage = function (match, callback) {
  // make sure the folder exists
  fs.mkdir(`${outputDir}/${match.nyplUUID}`, (err, folder) => {    
    request(match.metImgUrl).pipe(fs.createWriteStream(`${outputDir}/${match.nyplUUID}/met.jpg`)).on('close', () =>{
      callback(null,match)
    }).on('error', () =>{
      console.error('------------------')
      console.error('Error downloading ', match.metImgUrl)
      console.error('------------------')
      callback(null,match)
    })
  })
}

var downloadNYPLImage = function (match, callback) {
  // make sure the folder exists
  fs.mkdir(`${outputDir}/${match.nyplUUID}`, (err, folder) => {
    request(match.nyplCapture).pipe(fs.createWriteStream(`${outputDir}/${match.nyplUUID}/nypl.jpg`)).on('close', () =>{
      callback(null,match)
    }).on('error', () =>{
      console.error('------------------')
      console.error('Error downloading ', match.nyplCapture)
      console.error('------------------')
      callback(null,match)
    })
  })
}

var wait = function (data, callback) {
  setTimeout(()=>{
    callback(null,data)
  },2000)
}



_(metNYPLMatches)
	.map((match) => {
    // no weak stuff
    if (match.lowestScore === 30) return ''
    return match
  })
  .compact()
  .map((match) => {
    // pick a radom met image to use
    var useMet = Math.floor(Math.random() * (metObjs[match.lowestTitle].length)-1) + 0
    if (useMet===-1) useMet = 0
    useMet = metObjs[match.lowestTitle][useMet]

    // pick a rando nypl
    var useNypl = Math.floor(Math.random() * (match.nyplCaptures.length)-1) + 0
    if (useNypl===-1) useNypl = 0
    useNypl = match.nyplCaptures[useNypl]


    if (match.nyplCaptures.length === 1){
      var useNypl = match.nyplCaptures[0]
    }else if (match.nyplCaptures.length === 2){
      // if there is a Front/Back
      if (match.nyplCaptures[0].search('F&t=g') > -1){
        useNypl = match.nyplCaptures[0]
      }else if (match.nyplCaptures[1].search('F&t=g') > -1){
        useNypl = match.nyplCaptures[1]
      }
    }

    var obj = {
      nyplCapture : useNypl,
      nyplTitle : match.nyplTitle,
      nyplUUID : match.nyplUUID,
      score : match.lowestScore,
      metTitle : match.lowestTitle,
      metWebURL : useMet
    }
    if (!obj.nyplCapture || !obj.nyplTitle || !obj.nyplUUID || !obj.score || !obj.metTitle || !obj.metWebURL) return ''

    // see if we already have done this one
    try {
      stats = fs.statSync(`${outputDir}/${match.nyplUUID}`);
      stats = fs.statSync(`${outputDir}/${match.nyplUUID}/nypl.jpg`);
      stats = fs.statSync(`${outputDir}/${match.nyplUUID}/met.jpg`);
      stats = fs.statSync(`${outputDir}/${match.nyplUUID}/meta.json`);
      console.log(match.nyplUUID, 'already downloaded')
      return ''
    }
    catch (e) {
      console.log('Working',match.nyplUUID)
      return obj
    }
  })
  .compact()
  //try to get the url to the met image
  .map(_.curry(downloadMetHTML))
  .nfcall([])
  .series()
  .map((match) => {

    // pull out the link
    if (!match.metWebURLHTML) return ''

    var regexMatch = match.metWebURLHTML.match(/http:\/\/images\.metmuseum\.org\/CRDImages\/[a-z]+\/web-large\/.*?\.jpg/i)

    if (!regexMatch) return ''
    if (!regexMatch[0]) return ''

    match.metImgUrl = regexMatch[0]
    // fix the NYPL for a smaller dertivitve
    match.nyplCapture = match.nyplCapture.replace('&t=g','&t=w')

    if (!match.metImgUrl || !match.nyplCapture) return ''

    return match
  })
  .compact()
  .map(_.curry(downloadMetImage))
  .nfcall([])
  .series()
  .map(_.curry(downloadNYPLImage))
  .nfcall([])
  .series()
  .map((match) => {
    var output = fs.createWriteStream(`${outputDir}/${match.nyplUUID}/meta.json`)
    output.end(JSON.stringify(match, null, 2))
    return match
  })
  .map(_.curry(wait))
  .nfcall([])
  .series()
  // .map((match) => {
  //   //verify everything worked
  //   if (!fs.existsSync(`${outputDir}/${match.nyplUUID}/meta.json`) || !fs.existsSync(`${outputDir}/${match.nyplUUID}/nypl.jpg`) || !fs.existsSync(`${outputDir}/${match.nyplUUID}/met.jpg`)) {      
  //       if (!fs.existsSync(`${outputDir}/${match.nyplUUID}/meta.json`)) fs.unlinkSync(`${outputDir}/${match.nyplUUID}/meta.json`)
  //       if (!fs.existsSync(`${outputDir}/${match.nyplUUID}/nypl.jpg`))  fs.unlinkSync(`${outputDir}/${match.nyplUUID}/nypl.jpg`)
  //       if (!fs.existsSync(`${outputDir}/${match.nyplUUID}/met.jpg`))  fs.unlinkSync(`${outputDir}/${match.nyplUUID}/met.jpg`)
  //       if (!fs.existsSync(`${outputDir}`))  fs.unlinkSync(`${outputDir}`)
  //       console.log(outputDir,"failed")
  //   }
  // })
  .done(()=>{})

// process.on('uncaughtException', function (err) {
//   console.log(err)
//   console.error(err.stack)
//   console.log("Node NOT Exiting...")
// })
