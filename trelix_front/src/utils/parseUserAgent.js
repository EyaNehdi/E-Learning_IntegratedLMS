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

export default function parseUserAgentAdmin(userAgent) {
    let browser = "Unknown";
    let os = "Unknown";

    if (!userAgent) return { browser, os };

    // Browser detection
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
        browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
        browser = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        browser = "Safari";
    } else if (userAgent.includes("Edg")) {
        browser = "Edge";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        browser = "Opera";
    }

    // OS detection
    if (userAgent.includes("Win")) {
        os = "Windows";
    } else if (userAgent.includes("Mac")) {
        os = "macOS";
    } else if (userAgent.includes("Linux")) {
        os = "Linux";
    } else if (userAgent.includes("Android")) {
        os = "Android";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        os = "iOS";
    }

    return { browser, os };
}
