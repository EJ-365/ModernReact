# Penwright — text to realistic handwriting

Turn typed text, Word, PDF and text files into handwriting that looks genuinely written by hand, then download it as PDF, PNG or JPG. Everything runs in the browser: there is no server and files never leave the device.

- **Homepage** (`index.html`): live-rendered hero, try-it demo, font-vs-hand comparison, preset gallery, FAQ.
- **Studio** (`studio.html`): editor with live multi-page preview.
- **Desktop app**: installable PWA (Chrome, Edge, Safari "Add to Dock", Android, iOS "Add to Home Screen"). Works offline once installed and can open .docx/.pdf/.txt files from the file manager.

## Install on a desktop

The release zip (`penwright-1.1.0.zip`, built with `npm run package`) contains `app/` (the built site), `source/` and launchers:

- **Windows**: double-click `Start Penwright (Windows).bat`, then click **Install app** in Chrome or Edge.
- **Mac**: right-click `Start Penwright (Mac).command` > Open, then **Install app** (Chrome/Edge) or File > Add to Dock (Safari).
- **Linux**: `./start-penwright.sh`, then **Install app**.

The launchers serve `app/` on `http://localhost:47815` (this computer only) because browsers only install apps from http(s). After installing, the app runs from its own icon without the launcher. Hosting `app/` on any static host works the same way.

## Run

```bash
npm install
npm run dev       # http://localhost:5190
npm run build     # static site in dist/ (host anywhere, works from a sub-folder)
npm run preview   # serve dist/ on http://localhost:5191
npm run package   # build + one release zip in release/ (app, source, launchers)
```

## Features

| | |
|---|---|
| **Import** | .docx (Mammoth), .pdf with text layer (PDF.js), .txt, .md, .odt, .rtf, .html, or drag & drop. Headings, bullets and paragraphs carry over. |
| **Export** | Multi-page PDF at the exact paper size (jsPDF), PNG/JPG (ZIP for multi-page, JSZip), print, copy to clipboard. 150 / 200 / 300 dpi. |
| **Hands** | 28 bundled open-source handwriting fonts (print, messy, cursive, marker) + upload your own .ttf/.otf/.woff (kept in IndexedDB). |
| **Pens** | Ballpoint (skips, blobs), gel, fountain (pooling, shading), fineliner, felt tip (bleed), HB pencil (graphite grain); 9 inks + custom colour. |
| **Paper** | College / wide / A4 ruled, yellow legal pad, assignment sheet with Name/Date boxes, graph, dot grid, printer, cream laid, aged parchment, kraft, index card, sticky note, or your own image. Holes, torn spiral edge, US Letter / A4 / A5 / Legal. |
| **Realism** | Per-letter rotation, size, slant and glyph warp; baseline wobble; line slope; margin drift; pressure; hand fatigue; ragged right edge; mistakes crossed out and rewritten; smudges. Seeded, so a page is reproducible and "Re-roll" writes it again. |
| **Finish** | Digital, flatbed scan, photocopy, or phone photo on a desk (oak, walnut, white, slate, linen, concrete) with perspective, page curl, light falloff and hand shadow. |
| **Layout** | Side panel can be hidden (click the open tab again, the Hide button, or `Ctrl/Cmd+B`), widened with one click, or dragged to any width (double-click the edge to reset). **Full editor** opens a full-screen text box for long documents. On phones the preview sits on top and the controls below. |
| **Header** | Name, date (today in 5 formats or custom), centered title, subject/class, page numbers. |

Shortcuts: `Ctrl/Cmd+E` download, `Ctrl/Cmd+O` import, `Ctrl/Cmd+P` print, `Alt+R` re-roll, `Ctrl/Cmd+B` hide/show the side panel. Double-click a slider to reset it.

## Code map

- `src/engine/` — rendering engine (no UI): `fonts.js` catalogue + glyph fallback, `paper.js` templates and textures, `layout.js` Markdown-lite parsing and line wrapping in millimetres, `render.js` ink simulation, `finish.js` scan/photocopy/photo effects, `rng.js` seeded noise.
- `src/studio/` — studio UI, importers, exporters.
- `src/home/` — homepage demos.
- `src/pwa.js`, `public/sw.js`, `public/manifest.webmanifest` — install and offline support (the build writes the file list into `dist/sw.js`).
- `desktop/` — launchers and the read-me that go into the release zip; `scripts/package.mjs` builds it.

Scanned PDFs (images only) contain no text to import; OCR them first. Legacy `.doc` must be re-saved as `.docx`.

Fonts are SIL OFL / Apache 2.0 licensed via Fontsource.

Built by [Ejay Gabriel](https://github.com/EJ-365), Frontend Developer.
