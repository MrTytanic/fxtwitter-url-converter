const menuId = "copy-embed-link";

browser.menus.removeAll().then(() => {
    browser.menus.create({
        id: menuId,
        title: "Copy Embed Link",
        contexts: ["all"],
        documentUrlPatterns: ["*://x.com/*", "*://*.x.com/*", "*://twitter.com/*", "*://*.twitter.com/*"]
    });
}).catch(console.error);

browser.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== menuId) return;

    let postUrl;

    if (tab?.id != null) {
        try {
            postUrl = await browser.tabs.sendMessage(tab.id, { action: "getPostUrl" }, { frameId: info.frameId ?? 0 });
        } catch (error) {
            console.debug("Content script unavailable:", error.message);
        }
    }

    const url = [postUrl, info.linkUrl, info.pageUrl].find(value => {
        if (!value) return false;

        try {
            const { hostname, pathname } = new URL(value);
            return /^(www\.)?(x|twitter)\.com$/.test(hostname) &&
                   /^\/[^/]+\/status\/\d+(\/video\/\d+)?\/?$/.test(pathname);
        } catch {
            return false;
        }
    });

    if (!url) return;

    try {
        const link = new URL(url);

        link.hostname = "fixupx.com";
        link.pathname = link.pathname.replace(/\/video\/\d+\/?$/, "").replace(/\/$/, "");
        link.search = "";
        link.hash = "";

        await navigator.clipboard.writeText(link.href);
    } catch (error) {
        console.error("Failed to copy link:", error);
    }
});