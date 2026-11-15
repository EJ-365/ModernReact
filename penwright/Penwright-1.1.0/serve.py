# Penwright local launcher for macOS / Linux: serves the app folder on this computer only.
import http.server, os, socketserver, sys, threading, urllib.request, webbrowser

PORT = 47815
URL = f"http://localhost:{PORT}/studio.html"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")

try:
    urllib.request.urlopen(f"http://localhost:{PORT}/sw.js", timeout=1)
    print("Penwright is already running. Opening it...")
    webbrowser.open(URL)
    sys.exit(0)
except Exception:
    pass

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
                      ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
                      ".wasm": "application/wasm"}
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        if self.path.split("?")[0].endswith((".html", "/", "sw.js", ".webmanifest")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()
    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as srv:
    print(f"\n  Penwright is running at http://localhost:{PORT}/")
    print("  Keep this window open while you use it in the browser. Press Ctrl+C or close it to stop.\n")
    print('  Tip: click "Install app" in Penwright for a desktop app that works offline.\n')
    threading.Timer(0.6, lambda: webbrowser.open(URL)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
