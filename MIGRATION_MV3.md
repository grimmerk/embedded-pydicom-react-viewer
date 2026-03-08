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

### Pyodide CSP Issue (resolved)
- [x] **Pyodide 0.18.0 required `unsafe-eval`**, which MV3 extension pages do NOT allow
- Upgraded to Pyodide 0.29.3 which no longer uses `eval()`/`Function()` constructor
- CSP `wasm-unsafe-eval` is sufficient for 0.21.3+

## Solution: Upgrade Pyodide (0.18.0 → 0.29.3)

### Option A: npm pyodide package
- Install: `yarn add pyodide`
- Import: `import { loadPyodide } from "pyodide"`
- Needs [pyodide-webpack-plugin](https://github.com/pyodide/pyodide-webpack-plugin) for CRA/webpack bundling
- Ref: https://pyodide.org/en/stable/usage/working-with-bundlers.html
- **Downside**: CRA 4 (react-scripts 4.0.3) uses webpack 4; customizing webpack config requires eject or craco/react-app-rewired

### Option B: Local Pyodide files (chosen)
- Download Pyodide 0.29.3 release files to `public/pyodide/`
- Keep `<script src="pyodide/pyodide.js">` + `loadPyodide({indexURL})` approach
- Minimal build config change — no need to eject or add webpack plugins
- Required files: `pyodide.js`, `pyodide.asm.js`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`, plus `numpy`/`micropip` packages

### API Changes from 0.18 → 0.29.3 (researched)

#### JS-side (pyodideHelper.ts, App.tsx, jpegDecoder.ts)
| API | Status | Notes |
|-----|--------|-------|
| `loadPyodide({indexURL})` | **No change** | Still works the same way |
| `pyodide.loadPackagesFromImports(code)` | **No change** | Still available |
| `pyodide.runPythonAsync(code)` | **No change** | |
| `pyodide.globals.get(name)` | **No change** | |
| `PyProxy.getBuffer(type)` | **No change** | Still available on buffer-supporting objects |
| `PyBufferView.release()` | **No change** | Still required |
| `PyProxy.destroy()` | **No change** | Still required |
| `.callKwargs({...})` | **No change** | |
| `.toJs(1)` (deprecated code) | **Change** | Must use `.toJs({depth: 1})` — already noted in code comments |
| `micropip.install()` | **No change** | New optional params are backwards-compatible |

#### Python-side (dicom_parser.py)
| API | Status | Notes |
|-----|--------|-------|
| `import pyodide; pyodide.create_proxy()` | **Breaking** | Moved to `pyodide.ffi.create_proxy` in v0.23. Root-level access removed. |
| `buffer.to_py()` (JsProxy → Python) | **No change** | |
| `jsobj.destroy()` | **No change** | |

#### Behavioral changes to be aware of
| Version | Change | Impact |
|---------|--------|--------|
| v0.19 | PyProxy args passed to JS functions are auto-destroyed | Low — we already manage lifetimes manually |
| v0.24 | Lock file renamed `repodata.json` → `pyodide-lock.json` | Handled by using 0.29.3 files |
| v0.28 | JS `null` → `pyodide.ffi.jsnull` instead of `None` | Low — can pass `convertNullToNone: true` to `loadPyodide()` if needed |
| v0.29 | Python dict defaults to JS `Object` (was `Map`) | Low — we use `getBuffer()` for numpy, not `toJs()` on dicts |

### Migration Checklist
- [x] Download Pyodide 0.29.3 files to `public/pyodide/`
- [x] Update `download_pyodide.sh` for 0.29.3
- [x] Python: `import pyodide` + `pyodide.create_proxy(x)` → `from pyodide.ffi import create_proxy` + `create_proxy(x)`
- [x] Update pydicom wheel 2.2.1 → 2.4.4 (Python 3.13 compat)
- [x] Fix `baseURL()` to exclude URL hash fragment from Pyodide indexURL
- [x] Guard `__main__` block in dicom_parser.py from running in Pyodide
- [x] Test web mode: MR brain DICOM (512x512, MONOCHROME2, uncompressed) ✓
- [ ] Test Chrome extension mode (load as unpacked)
- [ ] Test compressed JPEG, multi-frame, 3D views

### pydicom Wheel
- Updated: `pydicom-2.4.4-py3-none-any.whl` (bundled locally in `public/pyodide/`)
- Pyodide 0.29.3 uses Python 3.13; pydicom 2.4.4 is pure Python (`py3-none-any`), compatible
- pydicom 3.0+ has breaking API changes (encaps, pixel_data_handlers refactored) — stay on 2.4.x

### Pyodide File Format Changes (0.18 → 0.29.3)
| 0.18.0 | 0.29.3 | Notes |
|--------|--------|-------|
| `pyodide.asm.data` (5.2MB) | `python_stdlib.zip` (2.3MB) | Stdlib bundled as zip instead of data blob |
| `packages.json` | `pyodide-lock.json` | Lock file renamed in v0.24 |
| `numpy.js` + `numpy.data` | `numpy-*.whl` | Packages now distributed as wheels |
| `micropip.js` + `micropip.data` | `micropip-*.whl` | Same |
| `packaging.*`, `pyparsing.*`, `setuptools.*` | Not needed | No longer required as separate files |

### Lessons Learned
- **`runPythonAsync` uses `__main__` namespace**: `__name__` is `"__main__"` in Pyodide's `runPythonAsync`, so `if __name__ == "__main__":` blocks WILL execute. Guard with `"pyodide" not in sys.modules` if the block is for local-only testing.
- **`baseURL()` must exclude hash fragment**: `window.location.href` includes `#...`, which corrupts relative URL resolution for Pyodide file fetching. Use `window.location.origin + window.location.pathname` instead.
- **Most JS-side Pyodide APIs are stable**: `getBuffer()`, `destroy()`, `release()`, `callKwargs()`, `loadPackagesFromImports()` all survived 0.18→0.29.3 unchanged.
- **Only Python-side breaking change**: `pyodide.create_proxy` → `pyodide.ffi.create_proxy` (root module access removed in v0.23).
- **Package size reduced**: Old Pyodide dir was ~30MB (with js+data pairs); new is ~16MB (core + whl files).

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
