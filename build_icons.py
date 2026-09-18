from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)

S = 1024
im = Image.new("RGBA", (S, S), (255, 255, 255, 0))
d = ImageDraw.Draw(im)

# Black rounded-square app tile.
d.rounded_rectangle((32, 32, 992, 992), radius=190, fill="black")

# Geometric white P.
d.rectangle((145, 230, 285, 790), fill="white")
d.rounded_rectangle((145, 230, 555, 555), radius=155, fill="white")
d.ellipse((270, 315, 455, 500), fill="black")

# Geometric white B.
d.rectangle((535, 230, 675, 790), fill="white")
d.rounded_rectangle((535, 230, 895, 505), radius=135, fill="white")
d.rounded_rectangle((535, 515, 895, 790), radius=135, fill="white")
d.ellipse((650, 300, 815, 465), fill="black")
d.ellipse((650, 555, 815, 720), fill="black")

# Small white reflections make the letter counters read as pinballs.
for box in ((650, 300, 815, 465), (650, 555, 815, 720), (270, 315, 455, 500)):
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1
    d.arc((x1 + int(w*.18), y1 + int(h*.16), x1 + int(w*.68), y1 + int(h*.66)),
          205, 275, fill="white", width=max(12, int(w*.08)))

png = OUT / "pinblocks-icon.png"
ico = OUT / "pinblocks-icon.ico"
icns = OUT / "pinblocks-icon.icns"
im.save(png, "PNG", optimize=True)
im.save(ico, "ICO", sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
im.save(icns, "ICNS")
print(f"Created {png.name}, {ico.name}, {icns.name}")
