import boto3, json, tweepy
from random import randint

def lambda_handler(event, context):

	s3 = boto3.client('s3')


	paginator = s3.get_paginator('list_objects')

	# Create a PageIterator from the Paginator
	page_iterator = paginator.paginate(Bucket='THEBUCKET', Prefix='todo/')

	allKeys = []

	for page in page_iterator:
	    for item in page['Contents']:
	    	key = item['Key'].split('/')
	    	if key[1] not in allKeys and len(key[1]) == 36:

	    		allKeys.append(key[1])

	useKey = allKeys[randint(0,len(allKeys)-1)]


	try:
		s3.download_file('THEBUCKET', 'todo/' + useKey + '/meta.json' , '/tmp/meta.json')
		s3.download_file('THEBUCKET', 'todo/' + useKey + '/image.jpg' , '/tmp/image.jpg')
		with open('/tmp/meta.json') as jsondata:
			meta = json.load(jsondata)

		with open('/tmp/image.jpg') as jsondata:
			jsondata = jsondata
	except Exception as e:
		print 'Could not download image and or metadata from' + useKey
		print e.__doc__
		print e.message
		quit()






	auth = tweepy.OAuthHandler('xxxxx', 'xxxxxxxxx')
	auth.set_access_token('yyyyyyy', 'yyyyyyyy')
	api = tweepy.API(auth)

	if len(meta['nyplTitle']) > 40:
		meta['nyplTitle'] = meta['nyplTitle'][0:37] + '..'

	if len(meta['metTitle']) > 40:
		meta['metTitle'] = meta['metTitle'][0:37] + '..'

	msg = 'NYPL: ' + meta['nyplTitle'] + '\n' + 'https://digitalcollections.nypl.org/items/' + meta['nyplUUID'] + '\n'
	msg = msg + 'MET: ' + meta['metTitle'] + '\n' +  meta['metWebURL']

	msg_no_links = 'NYPL: ' + meta['nyplTitle'] + '\n\n'
	msg_no_links = msg_no_links + 'MET: ' + meta['metTitle'] + '\n'

	try:
		api.update_with_media('/tmp/image.jpg', status=msg)
	except Exception as e:
		print "Something wrong posting to twitter " + useKey
		print e.__doc__
		print e.message
		quit()


	# remove it from s3
	s3 = boto3.resource('s3')
	bucket = s3.Bucket('THEBUCKET')
	for obj in bucket.objects.filter(Prefix='todo/'+useKey):
		s3.Object(bucket.name, obj.key).delete()
