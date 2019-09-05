const _ = require('highland')
const fs = require('fs')
const request = require('request')
const puppeteer = require('puppeteer');



var metObjs = fs.readFileSync('data/met_title_lookup.json', 'utf8');
metObjs = JSON.parse(metObjs)

var metNYPLMatches = fs.readFileSync('data/cle_met_matches.json', 'utf8');
metNYPLMatches = JSON.parse(metNYPLMatches)

var titleCounter = {}

// var browser = null
// var page = null
// var chain = Promise.resolve();


// async function pinit(){
//   browser = await puppeteer.launch({headless: false});
//   page = await browser.newPage();
//   // await page.goto('https://www.metmuseum.org/art/collection/search/343159');
//   // await page.waitFor(240*1000)
//   // console.log("Times yuppppp")
//   // await page.goto('https://www.metmuseum.org/art/collection/search/343098');
// }

// async function goto(url){
//   chain = chain.then(async () => {
//     await page.goto(url);

//     // const buffer = await page.pdf({
//     //   path: `test-${counter}.pdf`,
//     //   height: "1400px"
//     // });
//     // counter++;
//     // res.send({ success: buffer });
//     // console.log("sent");
//   });
// }




// pinit()
// goto('https://www.metmuseum.org/art/collection/search/343159')
// goto('https://www.metmuseum.org/art/collection/search/343098')

var outputDir = 'data/output'

var downloadMetHTML = function (match, callback) {
  // console.log("YEAHHH")


  // async function doit(){


  //   const browser = await puppeteer.connect({
  //     browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/8be229c1-46b5-4308-a655-b74a41a63764',
  //   });

  //   const page = await browser.newPage();
  //   await page.goto(match.metWebURL, {
  //       waitUntil: 'networkidle0' // 'networkidle0' is very useful for SPAs.
  //   });

  //   let mostSearchedList = await page.evaluate(() => {
  //       let objectList = document.querySelectorAll('.gtm__download__image');
  //       let mostSearched = [];

  //       objectList.forEach((item) => {
  //           mostSearched.push(item.href);
  //       });

  //       return mostSearched;
  //   });

  //   console.log(mostSearchedList)

  //   await page.waitFor(100)
  //   page.close(); 

  //   var imgUrl = false
  //   if (mostSearchedList.length > 0){

  //     if (mostSearchedList[0].indexOf('.jpg') > -1){
  //       imgUrl = mostSearchedList[0]
  //     }

  //   } 

  //   match.metImgUrl = imgUrl

  //   callback(null,match)
  // }

  // doit()

  var id = match.metWebURL.split('/search/')[1]

  console.log('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+id)
  request('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+id, {headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36' }}, function (error, response, body) {

    if (!error && response.statusCode == 200) {

      match.metImgUrl = JSON.parse(body)['primaryImageSmall']
      console.log(`-->${match.metImgUrl}`)

      callback(null,match)
    }else{
      match.metWebURLHTML = false
      callback(null,match)
    }
  })




}

var downloadMetImage = function (match, callback) {
  // make sure the folder exists
  fs.mkdir(`${outputDir}/${match.accessionCle}`, (err, folder) => {    
    console.log(match.metImgUrl)
    request(match.metImgUrl).pipe(fs.createWriteStream(`${outputDir}/${match.accessionCle}/met.jpg`)).on('close', () =>{
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
  fs.mkdir(`${outputDir}/${match.accessionCle}`, (err, folder) => {
    request(match.cleUrl).pipe(fs.createWriteStream(`${outputDir}/${match.accessionCle}/cle.jpg`)).on('close', () =>{
      callback(null,match)
    }).on('error', () =>{
      console.error('------------------')
      console.error('Error downloading ', match.cleUrl)
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

    if (!titleCounter[useMet]){
      titleCounter[useMet] = 0
    }
    titleCounter[useMet]++

    if (titleCounter[useMet] > 20){
      console.log(titleCounter)
      return ''
    }

    // // pick a rando nypl
    // var useNypl = Math.floor(Math.random() * (match.cleUrls.length)-1) + 0
    // if (useNypl===-1) useNypl = 0
    // useNypl = match.cleUrls[useNypl]


    // if (match.cleUrls.length === 1){
    //   var useNypl = match.cleUrls[0]
    // }else if (match.cleUrls.length === 2){
    //   // if there is a Front/Back
    //   if (match.cleUrls[0].search('F&t=g') > -1){
    //     useNypl = match.cleUrls[0]
    //   }else if (match.cleUrls[1].search('F&t=g') > -1){
    //     useNypl = match.cleUrls[1]
    //   }
    // }

    var obj = {
      cleUrl : match.cleImg.url,
      nyplTitle : match.nyplTitle,
      accessionCle : match.accessionCle,
      score : match.lowestScore,
      metTitle : match.lowestTitle,
      metWebURL : useMet
    }
    if (!obj.cleUrl || !obj.nyplTitle || !obj.accessionCle || !obj.score || !obj.metTitle || !obj.metWebURL) return ''

    // see if we already have done this one
    try {
      stats = fs.statSync(`${outputDir}/${match.accessionCle}`);
      stats = fs.statSync(`${outputDir}/${match.accessionCle}/cle.jpg`);
      stats = fs.statSync(`${outputDir}/${match.accessionCle}/met.jpg`);
      stats = fs.statSync(`${outputDir}/${match.accessionCle}/meta.json`);
      console.log(match.accessionCle, 'already downloaded')
      return ''
    }
    catch (e) {
      console.log('Working',match.accessionCle)
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
    if (!match.metImgUrl) return ''

    match.metImgUrl = match.metImgUrl.replace('original','web-large')
    match.cleTitle = match.nyplTitle
    delete match.nyplTitle



    if (!match.metImgUrl || !match.cleUrl) return ''

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
    var output = fs.createWriteStream(`${outputDir}/${match.accessionCle}/meta.json`)
    output.end(JSON.stringify(match, null, 2))
    return match
  })
  .map(_.curry(wait))
  .nfcall([])
  .series()
  // .map((match) => {
  //   //verify everything worked
  //   if (!fs.existsSync(`${outputDir}/${match.accessionCle}/meta.json`) || !fs.existsSync(`${outputDir}/${match.accessionCle}/nypl.jpg`) || !fs.existsSync(`${outputDir}/${match.accessionCle}/met.jpg`)) {      
  //       if (!fs.existsSync(`${outputDir}/${match.accessionCle}/meta.json`)) fs.unlinkSync(`${outputDir}/${match.accessionCle}/meta.json`)
  //       if (!fs.existsSync(`${outputDir}/${match.accessionCle}/nypl.jpg`))  fs.unlinkSync(`${outputDir}/${match.accessionCle}/nypl.jpg`)
  //       if (!fs.existsSync(`${outputDir}/${match.accessionCle}/met.jpg`))  fs.unlinkSync(`${outputDir}/${match.accessionCle}/met.jpg`)
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
