from PIL import Image

def almostEquals(a,b,thres=25):
    return all(abs(a[i]-b[i])<thres for i in range(len(a)))

image = Image.open("tmp/nypl.jpg").convert('RGBA')
pixeldata = list(image.getdata())

for i,pixel in enumerate(pixeldata):
    # if pixel[:3] == (255,255,255):
    print(pixel)
    if almostEquals(pixel[:3], (204,198,171)):
        pixeldata[i] = (255,255,255,0)

image.putdata(pixeldata)
image.save("tmp/output.png")