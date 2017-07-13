from PIL import Image

def computeAverageImageColor(img):
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

def almostEquals(a,b,thres=40):
    return all(abs(a[i]-b[i])<thres for i in range(len(a)))


image = Image.open("tmp/nypl.jpg")
pixeldata = list(image.getdata())

averageColor = computeAverageImageColor(image)

image = image.convert('RGBA')

for i,pixel in enumerate(pixeldata):
    if almostEquals(pixel[:3], averageColor):
        pixeldata[i] = (255,255,255,0)

image.putdata(pixeldata)
image.save("tmp/nypl_resize1_trans2.png")