from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "assets"
ROOT.mkdir(parents=True, exist_ok=True)

ASSETS = [
    {
        "url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3KKN5GT6UZPb5mt3kg5TPjF58M3/40c42ee4-2d1c-4671-99f4-add710ec25c1.jpg",
        "target": "hero-portrait.webp",
        "box": (315,18,1200,810),
        "size": (950,850),
        "quality": 82
    },
    {
        "url": "https://d2ol7oe51mr4n9.cloudfront.net/user_3KKN5GT6UZPb5mt3kg5TPjF58M3/c653bc41-59c6-4c26-853f-56f54c559be7.jpg",
        "target": "about-profile.webp",
        "box": (95,265,900,1200),
        "size": (760,885),
        "quality": 81
    }
]

for asset in ASSETS:
    request = Request(asset["url"], headers={"User-Agent": "Portfolio-photo-import/1.0"})
    with urlopen(request, timeout=35) as response:
        raw = response.read()
    if len(raw) < 20000:
        raise RuntimeError("Unexpectedly small photograph: " + asset["target"])
    img = Image.open(BytesIO(raw))
    img = ImageOps.exif_transpose(img).convert("RGB")
    if img.width < 1000 or img.height < 1100:
        raise RuntimeError("Original photograph resolution too low to process.")
    img = img.crop(asset["box"])
    img = ImageEnhance.Color(img).enhance(.87)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img.thumbnail(asset["size"], Image.Resampling.LANCZOS)
    destination = ROOT / asset["target"]
    img.save(destination, "WEBP", quality=asset["quality"], method=6)
    if destination.stat().st_size < 25000:
        raise RuntimeError("Portrait unexpectedly compressed too much: " + asset["target"])
    print(f"Saved {destination.name}: {img.size[0]}x{img.size[1]}, {destination.stat().st_size} bytes")
