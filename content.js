let selectedPostUrl = null;

document.addEventListener("contextmenu", (event) => {
    const target = event.target instanceof Element
        ? event.target
        : event.target?.parentElement;

    selectedPostUrl = target
        ?.closest("article")
        ?.querySelector('a[href*="/status/"]')
        ?.href ?? null;
}, true);

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "getPostUrl") {
        return Promise.resolve(selectedPostUrl);
    }
});