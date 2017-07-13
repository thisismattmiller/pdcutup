from PIL import Image


nypl = Image.open('tmp/nypl.jpg')
met = Image.open('tmp/met.jpg')
print(nypl.size[0],met.size)


if nypl.size[1] > met.size[1]:
	newHeight = nypl.size[1]
	newWidth = newHeight * met.size[0] / met.size[1]
	metOut = met.resize((int(newWidth), int(newHeight)), Image.ANTIALIAS)
	metOut.save('tmp/met_resize1.jpg')
	nypl.save('tmp/nypl_resize1.jpg')
else:
	newHeight = met.size[1]
	newWidth = newHeight * nypl.size[0] / nypl.size[1]
	nyplOut = nypl.resize((int(newWidth), int(newHeight)), Image.ANTIALIAS)
	nyplOut.save('tmp/nypl_resize1.jpg')
	met.save('tmp/met_resize1.jpg')


nypl = Image.open('tmp/nypl_resize1.jpg')
met = Image.open('tmp/met_resize1.jpg')

if nypl.size[0] + nypl.size[1] > met.size[0] + met.size[1]:
	print('nypl back')
else:
	print('met back')



# if nypl.size[0] > met.size[0]:
# 	newWidth = nypl.size[0]
# 	newHeight = newWidth * met.size[1] / met.size[0]
# 	metOut = met.resize((int(newWidth), int(newHeight)), Image.ANTIALIAS)
# 	metOut.save('tmp/met_resize2.jpg')
# 	nypl.save('tmp/nypl_resize2.jpg')
# else:
# 	newWidth = met.size[0]
# 	newHeight = newWidth * nypl.size[1] / nypl.size[0]
# 	nyplOut = nypl.resize((int(newWidth), int(newHeight)), Image.ANTIALIAS)
# 	nyplOut.save('tmp/nypl_resize2.jpg')
# 	met.save('tmp/met_resize2.jpg')