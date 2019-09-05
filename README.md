# pdcutup
Source code for https://twitter.com/PDCutup

Data sources:

https://github.com/NYPL-publicdomain/data-and-utilities

https://github.com/metmuseum/openaccess

https://github.com/ClevelandMuseumArt/openaccess

`build_met_title_lookup.js` - transforms the met for use

`cle_to_nd.py` - convert cleveland JSON dump to new line delimited dump

`match_met_to_nypl.js` - matches the nypl and met titles

`match_met_to_cle.js` - match CLE to met titles

`gather_resources.js` - downloads the images from both orgs

`create_images.py` - builds the collage images

`judge.js` - a small web app to select which images to use

`lambda_function.py` - the AWS lambda function that posts the images from S3 to twitter


