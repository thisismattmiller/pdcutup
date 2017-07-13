var express = require('express')
var glob = require('glob')
const fs = require('fs')

var app = express()




var dirToJudge = 'tojudge'
var dirOutput = 'output'


app.use(express.static(dirToJudge))

var tojudge = []
// load the things to judge
glob("judged/*", {}, function (er, judgedDirs) {
	glob("dont/*", {}, function (er, dontDirs) {

		judgedDirs = judgedDirs.map((judgedDir) => {
			return judgedDir.replace('judged/','')
		})
		dontDirs = dontDirs.map((dontDir) => {
			return dontDir.replace('dont/','')
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
  		fs.mkdir(`dont/${req.query.type}`, (err, folder) => {
  			res.redirect('/')
  		})

  	}else{
	  	// make the directory and populate it with the needed data
	  	fs.mkdir(`judged/${req.query.use}`, (err, folder) => {
	  		fs.writeFileSync(`judged/${req.query.use}/image.jpg`, fs.readFileSync(`${dirToJudge}/${req.query.use}${req.query.type}`))
	  		fs.writeFileSync(`judged/${req.query.use}/meta.json`, fs.readFileSync(`${dirOutput}/${req.query.use}/meta.json`))
	  		tojudge.shift()
			res.redirect('/')
	  	})
  	}
  }else{

  	  var meta = JSON.parse(fs.readFileSync(`${dirOutput}/${tojudge[0]}/meta.json`))
  	  if (bans.indexOf(meta.metTitle) > -1){
  		tojudge.shift()
  		fs.mkdir(`dont/${req.query.type}`, (err, folder) => {
  			console.log(meta.metTitle,'is banned')
  			res.redirect('/')
  		})
  	  	return false
  	  }
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
					        window.location  = "?use=dont&type=${tojudge[0]}"
					    }
					    if (evt.keyCode == 49) {
					        window.location  = "?use=${tojudge[0]}&type=_pixle_transparent_polygon.jpg"
					    }
					    if (evt.keyCode == 50) {
					        window.location  = "?use=${tojudge[0]}&type=_pixle_transparent.jpg"
					    }
					};

			  	</script>
			  	<hr style="clear:both">
			  	<br>
			  	<span>${meta.nyplTitle}</span><br>
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