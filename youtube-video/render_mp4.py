"""Render fakta-gelitik.html ke MP4 1080x1920 (30 fps) tanpa suara.
Pakai Microsoft Edge yang sudah terpasang + ffmpeg dari imageio-ffmpeg."""
import pathlib, subprocess, sys
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
HTML = (HERE / "fakta-gelitik.html").resolve().as_uri()
OUT = HERE / "fakta-gelitik.mp4"
FPS = 30

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
proc = subprocess.Popen(
    [ffmpeg, "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
     "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
     "-movflags", "+faststart", str(OUT)],
    stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge")
    page = b.new_page(viewport={"width": 540, "height": 960}, device_scale_factor=2)
    page.goto(HTML)
    page.wait_for_timeout(500)
    info = page.evaluate("renderInfo()")
    frames = int(info["total"] / 1000 * FPS)
    print(f"durasi {info['total']/1000:.1f}s, {frames} frame", flush=True)
    for f in range(frames):
        page.evaluate(f"renderAt({f * 1000 / FPS})")
        proc.stdin.write(page.screenshot(type="jpeg", quality=92))
        if f % 150 == 0:
            print(f"{f}/{frames}", flush=True)
    b.close()

proc.stdin.close()
proc.wait()
print("selesai:", OUT, OUT.stat().st_size // 1024, "KB")
