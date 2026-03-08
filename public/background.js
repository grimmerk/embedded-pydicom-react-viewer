// Open extension page when icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: "index.html",
  });
});

// Redirect http/https .dcm/.dicom URLs to extension viewer
chrome.runtime.onInstalled.addListener(() => {
  const extensionUrl = chrome.runtime.getURL("index.html");

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: extensionUrl + "#\\0",
          },
        },
        condition: {
          regexFilter: "^(https?://.*\\.dcm(\\?.*)?)$",
          resourceTypes: ["main_frame"],
        },
      },
      {
        id: 2,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: extensionUrl + "#\\0",
          },
        },
        condition: {
          regexFilter: "^(https?://.*\\.dicom(\\?.*)?)$",
          resourceTypes: ["main_frame"],
        },
      },
    ],
  });
});

// Redirect file:// .dcm/.dicom URLs via webNavigation (declarativeNetRequest doesn't support file://)
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = details.url;
  const urlLower = url.toLowerCase();
  if (
    details.frameId === 0 &&
    urlLower.startsWith("file://") &&
    (urlLower.endsWith(".dcm") || urlLower.endsWith(".dicom"))
  ) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("index.html") + "#" + url,
    });
  }
});
