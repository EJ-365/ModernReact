# Penwright local launcher for Windows: serves the app folder on this computer only and opens it.
$ErrorActionPreference = 'Stop'
$port = 47815
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'app'))
$url = "http://localhost:$port/"
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript'; '.mjs' = 'text/javascript'; '.css' = 'text/css'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.ico' = 'image/x-icon'
  '.woff2' = 'font/woff2'; '.woff' = 'font/woff'; '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'
  '.txt' = 'text/plain; charset=utf-8'; '.wasm' = 'application/wasm'
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try { $listener.Start() } catch {
  Write-Host "Penwright is already running (or port $port is in use). Opening it..."
  Start-Process ($url + 'studio.html')
  exit 0
}
Write-Host ''
Write-Host "  Penwright is running at $url"
Write-Host '  Keep this window open while you use it in the browser. Close it to stop.'
Write-Host ''
Write-Host '  Tip: click "Install app" in Penwright to get a desktop app with its own'
Write-Host '  icon that works offline. After that you will not need this window.'
Write-Host ''
Start-Process ($url + 'studio.html')
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel = $rel + 'index.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if ($path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and [IO.File]::Exists($path)) {
      $bytes = [IO.File]::ReadAllBytes($path)
      $ext = [IO.Path]::GetExtension($path).ToLower()
      if ($mime.ContainsKey($ext)) { $res.ContentType = $mime[$ext] } else { $res.ContentType = 'application/octet-stream' }
      if ($ext -eq '.html' -or $rel -eq 'sw.js' -or $ext -eq '.webmanifest') { $res.Headers.Add('Cache-Control', 'no-cache') }
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $res.StatusCode = 404
    }
    $res.OutputStream.Close()
  } catch { }
}
