import os, json
from PIL import Image
from PIL import ImageDraw
from random import randint

# check if a pixle is close
def almostEquals(a,b,thres=35):
    return all(abs(a[i]-b[i])<thres for i in range(len(a)))

# get the most common color
def compute_average_image_color(img):
    width, height = img.size

    r_total = 0
    g_total = 0
    b_total = 0

    count = 0
    for x in range(0, width):
        for y in range(0, height):
            r, g, b = img.getpixel((x,y))
            r_total += r
            g_total += g
            b_total += b
            count += 1

    return (int(r_total/count), int(g_total/count), int(b_total/count))


def createPoly(img):
	maxWidth = img.size[0]
	maxHeight = img.size[1]

	sides = randint(5,15)

	points = []

	for side in range(sides):

		points.append((randint(0,maxWidth),randint(0,maxHeight)))

	return points




dirs = os.walk('output')

counter = 0


for aDir in dirs:
	print(aDir)
	if 'met.jpg' in aDir[2] and 'nypl.jpg' in aDir[2]:
		print(aDir)

		with open(aDir[0] + '/' + 'meta.json') as jsondata:
		    meta = json.load(jsondata)

		if os.path.isfile('tojudge3/' + meta['nyplUUID'] + '_pixle_transparent_polygon.jpg'):
			print(meta['nyplUUID'], 'is already complete')
			continue

		# figure out which image should be the background and export them
		try:
			nypl = Image.open(aDir[0] + '/' + 'nypl.jpg')
			met = Image.open(aDir[0] + '/' + 'met.jpg')
		except:
			print(aDir[0],'images are corrupted')
			continue

		if nypl.size[1] > met.size[1]:
			newHeight = nypl.size[1]
			newWidth = newHeight * met.size[0] / met.size[1]
			metOut = met.resize((int(newWidth), int(newHeight)), Image.ANTIALIAS)
			metOut.save(aDir[0] + '/' +'background.jpg')
			nypl.save(aDir[0] + '/' + 'foreground.jpg')
		else:
			newHeight = met.size[1]
			newWidth = newHeight * nypl.size[0] / nypl.size[1]
			nyplOut = nypl.resize((int(newWidth), int(newHeight)), Image.ANTIALIAS)
			nyplOut.save(aDir[0] + '/' + 'background.jpg')
			met.save(aDir[0] + '/' + 'foreground.jpg')


		nypl.close()
		met.close()

		# get the most common color and make it transparent

		img = Image.open(aDir[0] + '/' + 'foreground.jpg').convert('RGB')
		#img = img.resize((50,50))  # Small optimization
		average_color = compute_average_image_color(img)
		img.close()

		foreground = Image.open(aDir[0] + '/' + 'foreground.jpg').convert('RGBA')
		pixeldata = list(foreground.getdata())

		for i,pixel in enumerate(pixeldata):
		    if almostEquals(pixel[:3], average_color):
		        pixeldata[i] = (255,255,255,0)

		counter = counter + 1
		foreground.putdata(pixeldata)
		foreground.save(aDir[0] + '/' + 'pixle_transparent.png')

		foreground.close()

		# make the polygon cutout version
		foreground = Image.open(aDir[0] + '/' + 'foreground.jpg').convert('RGBA')
		mask=Image.new('L', img.size, color=255)
		draw=ImageDraw.Draw(mask)
		draw.polygon(createPoly(foreground), fill=0)

		foreground.putalpha(mask)
		# foreground.save('tmp/' + str(counter) + 'pixle_transparent_polygon.png')
		foreground.save(aDir[0] + '/' + 'pixle_transparent_polygon.png')




		# over lap and save out
		background = Image.open(aDir[0] + '/' + 'background.jpg').convert('RGBA')
		overlay = Image.open(aDir[0] + '/' + 'pixle_transparent.png')
		background.paste(overlay, (0,0), overlay)
		new = Image.new('RGBA', (overlay.size[0], overlay.size[1]), (255, 255, 255, 255))
		new.paste(background, (0,0), background)
		new.convert('RGB')
		new.save('tojudge3/' + meta['nyplUUID'] + '_pixle_transparent.jpg')

		# over lap and save out
		background = Image.open(aDir[0] + '/' + 'background.jpg').convert('RGBA')
		overlay = Image.open(aDir[0] + '/' + 'pixle_transparent_polygon.png')
		background.paste(overlay, (0,0), overlay)
		new = Image.new('RGBA', (overlay.size[0], overlay.size[1]), (255, 255, 255, 255))
		new.paste(background, (0,0), background)
		new.convert('RGB')
		new.save('tojudge3/' + meta['nyplUUID'] + '_pixle_transparent_polygon.jpg')




