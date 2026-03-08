// Open extension page when icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: "index.html",
  });
});

// Redirect .dcm/.dicom file URLs to extension viewer
chrome.runtime.onInstalled.addListener(() => {
  const extensionUrl = chrome.runtime.getURL("index.html");

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3, 4],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { regexSubstitution: extensionUrl + "#\\0" },
        },
        condition: {
          regexFilter: "^(https?://.*\\.dcm)$",
          resourceTypes: ["main_frame", "sub_frame"],
        },
      },
      {
        id: 2,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { regexSubstitution: extensionUrl + "#\\0" },
        },
        condition: {
          regexFilter: "^(https?://.*\\.dicom)$",
          resourceTypes: ["main_frame", "sub_frame"],
        },
      },
      {
        id: 3,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { regexSubstitution: extensionUrl + "#\\0" },
        },
        condition: {
          regexFilter: "^(file://.*\\.dcm)$",
          resourceTypes: ["main_frame", "sub_frame"],
        },
      },
      {
        id: 4,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { regexSubstitution: extensionUrl + "#\\0" },
        },
        condition: {
          regexFilter: "^(file://.*\\.dicom)$",
          resourceTypes: ["main_frame", "sub_frame"],
        },
      },
    ],
  });
});
