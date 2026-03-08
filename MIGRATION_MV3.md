# Manifest V3 Migration Notes

## Current Status

PR: https://github.com/grimmerk/embedded-pydicom-react-viewer/pull/4

### Done
- [x] `manifest_version` 2 → 3
- [x] `browser_action` → `action`
- [x] `_execute_browser_action` → `_execute_action`
- [x] `web_accessible_resources` array → object format
- [x] `content_security_policy` string → object format
- [x] Remove `background.scripts` (non-existent file), add `background.service_worker`
- [x] Create `background.js` service worker (icon click opens viewer, redirect .dcm URLs)
- [x] Replace `webRequestBlocking` with `declarativeNetRequestWithHostAccess` (for http/https .dcm redirect)
- [x] Use `webNavigation` for `file://` .dcm redirect (`declarativeNetRequest` doesn't support `file://` scheme)
- [x] Add missing icon files (`Dicom_16.png`, `Dicom_48.png`, `Dicom_128.png`) from `dicom-web-viewer` repo
- [x] Remove PWA fields (`start_url`, `display`, `theme_color`, `background_color`) that caused manifest icons warning

### Blocked — Pyodide CSP Issue
- [ ] **Pyodide 0.18.0 requires `unsafe-eval`**, which MV3 extension pages do NOT allow
- Error: `EvalError: Evaluating a string as JavaScript violates the following Content Security Policy directive because 'unsafe-eval' is not an allowed source of script: script-src 'self' 'wasm-unsafe-eval'`
- Current CSP uses `wasm-unsafe-eval` (allows WebAssembly) but Pyodide 0.18's JS glue code internally uses `eval()`/`Function()` constructor

## Solution: Upgrade Pyodide

### Option A: npm pyodide package (recommended)
- Latest version: **0.29.3** (current: 0.18.0)
- Install: `yarn add pyodide`
- Import: `import { loadPyodide } from "pyodide"`
- Pyodide 0.24+ explicitly supports MV3 without `unsafe-eval`
- Needs [pyodide-webpack-plugin](https://github.com/pyodide/pyodide-webpack-plugin) for CRA/webpack bundling
- Ref: https://pyodide.org/en/stable/usage/working-with-bundlers.html

### Option B: CDN/local Pyodide 0.24+
- Download Pyodide 0.24+ files to `public/pyodide/`
- Keep `<script src="pyodide/pyodide.js">` approach
- Less code change but still need to adapt API differences

### API Changes from 0.18 → 0.29
Key changes in `pyodideHelper.ts`:
1. `loadPyodide()` — API signature may have changed
2. `pyodide.loadPackagesFromImports()` — may be renamed/removed
3. `pyodide.runPythonAsync()` — should still work
4. `pyodide.globals.get()` — should still work
5. `.toJs()` — parameter format changed (0.18 uses `toJs(1)`, newer uses `toJs({depth: 1})`)
6. `.getBuffer()` — may be replaced with `.to_js()` with buffer protocol
7. `micropip.install()` — should still work, but pydicom wheel version may need update

### pydicom Wheel
- Current: `pydicom-2.2.1-py3-none-any.whl` (bundled locally)
- May need to update to a newer version compatible with newer Pyodide
- Or install from PyPI: `await micropip.install('pydicom')`

## Chrome Web Store Considerations

### Privacy / Permissions Justification
- **Single purpose**: View medical DICOM image files in the browser
- **storage**: Not currently used (but may add for user preferences)
- **declarativeNetRequestWithHostAccess**: Redirect .dcm/.dicom URLs from any website to the extension viewer
- **webNavigation**: Detect when user drags local .dcm files into Chrome, redirect to viewer
- **host_permissions `<all_urls>`**: Needed to intercept .dcm URLs from any origin and fetch remote DICOM files via XHR
- **Remote code**: Select "No" — all JS/Python/WASM is bundled locally, no external script loading (when using local Pyodide)

### If using CDN Pyodide
- Must select "Yes" for remote code if loading from `cdn.jsdelivr.net`
- Prefer bundling locally to avoid this

### Store Description Update
- Update version in changelog
- Note: "Not for clinical use, reference only"
- Mention MV3 migration in changelog

## Build Notes
- `NODE_OPTIONS=--openssl-legacy-provider` required for current webpack 4 / Node.js 18+
- Build: `NODE_OPTIONS=--openssl-legacy-provider yarn build`
- Build output in `build/` folder, load as unpacked extension
- Pyodide files must be downloaded first: `sh download_pyodide.sh` (note: original zip URL is broken, use v0.2 release)
- `download_pyodide.sh` URL needs update to: `https://github.com/grimmerk/embedded-pydicom-react-viewer/releases/download/v0.2/pyodide.zip`
- The v0.2 release contains pydicom 2.1.2 wheel; code references 2.2.1 — need to download 2.2.1 separately from PyPI
