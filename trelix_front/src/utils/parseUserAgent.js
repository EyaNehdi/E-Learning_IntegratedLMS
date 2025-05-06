export function parseUserAgent(userAgent) {
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);

    return { browser, os };
}

function detectBrowser(ua) {
    if (/OPR\/|Opera/.test(ua)) return "Opera";
    if (/Edg\//.test(ua)) return "Edge";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/MSIE|Trident/.test(ua)) return "Internet Explorer";
    return "Unknown";
}

function detectOS(ua) {
    if (/Windows NT/.test(ua)) return "Windows";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Linux/.test(ua)) return "Linux";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    return "Unknown";
}