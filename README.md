# pdcutup
Source code for https://twitter.com/PDCutup

Data sources:

https://github.com/NYPL-publicdomain/data-and-utilities

https://github.com/metmuseum/openaccess

`build_met_title_lookup.js` - transforms the met for use

`match_met_to_nypl.js` - matches the nypl and met titles

`gather_resources.js` - downloads the images from both orgs

`create_images.py` - builds the collage images

`judge.js` - a small web app to select composit images to use

`lambda_function.py` - the AWS lambda function that posts the images from S3 to twitter


