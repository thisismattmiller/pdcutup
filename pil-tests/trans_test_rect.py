from PIL import Image
from PIL import ImageDraw
from random import randint


def createPoly(img):
	maxWidth = img.size[0]
	maxHeight = img.size[1]

	sides = randint(5,15)

	points = []

	for side in range(sides):

		points.append((randint(0,maxWidth),randint(0,maxHeight)))

	return points


img = Image.open("tmp/nypl_resize1.jpg")

createPoly(img)

mask=Image.new('L', img.size, color=255)
draw=ImageDraw.Draw(mask)
draw.polygon(createPoly(img), fill=0)

img.putalpha(mask)
img.save('tmp/nypl_resize1_trans.png')