# Sukoon-e-Qalb website

A static site for the Unlisted lecture series of [Sukoon-e-Qalb](https://www.youtube.com/@SukoonCourse). Open `index.html` in a browser, or serve the folder with any static host (GitHub Pages from the `main` branch root works). Nothing here publishes the videos on YouTube; they stay Unlisted.

## Refresh lectures (weekly)

Riyaad Us Saliheen gains a new lecture each week. From this folder, run:

```bash
python3 scripts/refresh-videos.py
```

The script re-pulls every playlist with `yt-dlp` and regenerates `videos.json` and `videos.js`. The last video in the Riyaad Us Saliheen playlist is treated as the latest weekly lecture and shown in the featured player.

If `yt-dlp` is not on your PATH, install it (`pip install yt-dlp`) or point to it:

```bash
YT_DLP=/path/to/yt-dlp python3 scripts/refresh-videos.py
```

After refreshing, commit and push to the GitHub repository so the live GitHub Pages site updates:

```bash
git add videos.json videos.js
git commit -m "Add latest Riyaad Us Saliheen lecture"
git push
```
