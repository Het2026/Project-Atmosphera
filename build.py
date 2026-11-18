"""Builds index.html (a single self-contained page) from the files in src/.

Usage:  python3 build.py
Output: index.html  (open it in a browser, or host it on GitHub Pages)
"""
import pathlib

root = pathlib.Path(__file__).parent
src = root / "src"
order = ["land", "cities", "cities2", "engine", "panel", "features", "helplines", "live", "globe", "ui"]

app = "(function(){'use strict';\n" + "\n".join((src / f"{n}.js").read_text() for n in order) + "\n})();"
shell = (src / "shell.html").read_text()
d3 = '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>\n'

page = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}</style></head><body>\n"
    + shell + d3 + "<script>\n" + app + "\n</script>\n</body></html>\n"
)
(root / "index.html").write_text(page)
print("wrote index.html", len(page), "bytes")
