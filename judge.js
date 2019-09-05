var express = require('express')
var glob = require('glob')
const fs = require('fs')

var app = express()




var dirToJudge = 'data/tojudge1'
var dirOutput = 'data/output-batch1'


app.use(express.static(dirToJudge))

var tojudge = []
// load the things to judge
glob("data/judged1/*", {}, function (er, judgedDirs) {
	glob("data/dont1/*", {}, function (er, dontDirs) {

		judgedDirs = judgedDirs.map((judgedDir) => {
			return judgedDir.replace('data/judged1/','')
		})
		dontDirs = dontDirs.map((dontDir) => {
			return dontDir.replace('data/dont1/','')
		})

		judgedDirs = judgedDirs.concat(dontDirs)

		glob(dirToJudge + "/*_pixle_transparent.jpg", {}, function (er, files) {
			var results = files.map((file) => {
				uuid = file.replace('_pixle_transparent.jpg','').replace(dirToJudge + '/','')
				if (judgedDirs.indexOf(uuid) > -1){
					return false
				}else{
					tojudge.push(uuid)
					return uuid
				}

			})
			// console.log(tojudge)
			tojudge.shift()
		})
	})
})

var bans = []
var last10 = []

app.get('/', function (req, res) {


  if (req.query.ban){
  	bans.push(req.query.ban)
  	var newToJudge = []
  	tojudge.forEach((uuid) =>{
  		try{
  	  		var meta = JSON.parse(fs.readFileSync(`${dirOutput}/${uuid}/meta.json`))
  	  		if (bans.indexOf(meta.metTitle) === -1){
  	  			newToJudge.push(uuid)
  	  		}
  		}catch (e){
  			console.log('Could not read metadata for',uuid)
  		}
  		tojudge = newToJudge
	})
  	res.redirect('/')
  	return false



  }

  if (req.query.use){

  	if (req.query.use==='dont'){
  		tojudge.shift()
  		fs.mkdir(`data/dont1/${req.query.type}`, (err, folder) => {
  			res.redirect('/')
  		})

  	}else{
	  	// make the directory and populate it with the needed data
	  	fs.mkdir(`data/judged1/${req.query.use}`, (err, folder) => {
	  		fs.writeFileSync(`data/judged1/${req.query.use}/image.jpg`, fs.readFileSync(`${dirToJudge}/${req.query.use}${req.query.type}`))
	  		fs.writeFileSync(`data/judged1/${req.query.use}/meta.json`, fs.readFileSync(`${dirOutput}/${req.query.use}/meta.json`))
	  		tojudge.shift()
			res.redirect('/')
	  	})
  	}
  }else{
      if (!tojudge[0]){
      	tojudge.shift()
      	res.redirect('/')
      }
  	  var meta = JSON.parse(fs.readFileSync(`${dirOutput}/${tojudge[0]}/meta.json`))
  	  if (bans.indexOf(meta.metTitle) > -1){
  		tojudge.shift()
  		fs.mkdir(`data/dont1/${req.query.type}`, (err, folder) => {
  			console.log(meta.metTitle,'is banned')
  			res.redirect('/')
  		})
  	  	return false
  	  }
  	  // last10.push(${tojudge[0]})
  	  // if (last10.lenght>10){
  	  // 	last10.shift()
  	  // }


  	  // var last10Str = ""
  	  // last10.forEach((l)=>{

  	  // 	last10Str = last10Str + `<a href="">${l}</a>`

  	  // })

	  res.send(`
			<!DOCTYPE html>
			<html>
			  <head>
			    <meta charset="UTF-8">
			    <title>title</title>
			  </head>
			  <body>
			  	<div style="float:left"><a href="?use=${tojudge[0]}&type=_pixle_transparent_polygon.jpg"><img src="http://localhost:4000/${tojudge[0]}_pixle_transparent_polygon.jpg"></a></div>
			  	<div style="float:right"><a href="?use=${tojudge[0]}&type=_pixle_transparent.jpg"><img src="http://localhost:4000/${tojudge[0]}_pixle_transparent.jpg"></a></div>
			  	<div style="float:right"><a href="?use=dont&type=${tojudge[0]}"><h2>Don't</h2></a></div>

			  	<script>
					document.onkeydown = function(evt) {
					    evt = evt || window.event;
					    console.log(evt.keyCode);
					    if (evt.keyCode == 27) {
					    	console.log("Yeahhh")
					    	console.log("?use=dont&type=${tojudge[0]}")
					        window.location  = "?use=dont&type=${tojudge[0]}"
					    }
					    if (evt.keyCode == 49) {
					        window.location  = "?use=${tojudge[0]}&type=_pixle_transparent_polygon.jpg"
					    }
					    if (evt.keyCode == 50) {
					        window.location  = "?use=${tojudge[0]}&type=_pixle_transparent.jpg"
					    }
					    evt.preventDefault();
					};

			  	</script>
			  	<hr style="clear:both">
			  	<br>
			  	<span>${meta.cleTitle}</span><br>
			  	<span>${meta.metTitle}</span>  <a href="?ban=${meta.metTitle}">BAN</a><br>
			  	<span>${tojudge.length}</span>
			  </body>
			</html>
	  	`)

  }


})

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})