from PIL import Image

background = Image.open("tmp/met_resize1.jpg").convert("RGBA")
overlay = Image.open("tmp/nypl_resize1_trans.png")
background.paste(overlay, (0,0), overlay)
new = Image.new('RGBA', (overlay.size[0], overlay.size[1]), (255, 255, 255, 255))
new.paste(background, (0,0), background)
new.save("tmp/output2.png","PNG")