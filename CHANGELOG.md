# Change Log

## v1.8
- Migrate to Chrome extension Manifest V3
- Upgrade Pyodide 0.18.0 → 0.29.3 (Python 3.9 → 3.13)
- Upgrade pydicom 2.2.1 → 2.4.4
- Add background service worker, declarativeNetRequest rules
- Use webNavigation for file:// .dcm redirect

## v1.7
- Migrate to use Python browser runtime and Python package to parse DICOM. Please wait for a second to load these.
- Improve UI.
- Add back PALETTE color support.
- List "1.2.840.10008.1.2.4.90" in not support list.
- When loading a folder to see its series plane views, if there are multiple series, we only show the first series and use the file/axial slider to switch files. Multiple series switching may be added in the future.

## v1.6
- Fix broken function to view online DICOM image
- Add the snapshot for axial/sagittal/coronal view.
- Show transferSyntax on UI and print RGB planar in console

## v1.5
- Add series mode to view different plane views (e.g. axial, sagittal, and coronal)

## v1.4
- Change icon

## v1.3
- [Add] Use mouse/touch press+move to change Window Center (level) and Window Width
- [Add] Add some difference common Window Center (level) modes (e.g. Brain/Lungs)
- [Add] Support MONOCHROME1 inverted color DICOM
- [Add] View multiple local files (sort by name)
- [Add] CLI tool to open DICOM files with this extension in your terminal
- [Add] Use shortcut (ctrl+u/cmd+u) to open extension viewer page
- [Add] Click extension icon to open extension viewer page
- [Remove] PALETTE COLOR DICOM support

## v1.2
- Remove the handle on outside-of-scan pixels.
- Add windowCenter/windowHeight mode
- Set maximal shown resolution and resize too large DICOM files.
- Support RGB and PALETTE COLOR DICOM files, useful for ultrasound DICOM
- Show some meta info. on UI

## v1.1.3
- Add the function to view online DICOM files. Also, add the support for .DCM, .DICOM and .dicom file extension.

## v1.1.2
- Detect outside-of-scan pixels and reset to minimal value (~air) when the file is using default unsigned pixel representation, intercept (-1024) and padding (-2000).

## v1.1.1
- Rename the extension to DICOM image viewer

## v1.1
- Support multi-frame file
- Add "drop file zone" in the opened DICOM extension page
- Add web site version: https://grimmer.io/dicom-web-viewer/

## v1.0
- Open DICOM p10 image file
