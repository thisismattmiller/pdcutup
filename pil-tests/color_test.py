from PIL import Image

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

img = Image.open('tmp/nypl.jpg')
#img = img.resize((50,50))  # Small optimization
average_color = compute_average_image_color(img)
print(average_color)