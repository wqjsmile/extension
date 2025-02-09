console.log('sw-omnibox.js');

// Initialize default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({
            apiSuggestions: ['tabs', 'storage', 'scripting']
        });
    }
});

const URL_CHROME_EXTENSIONS_DOC =
    'https://developer.chrome.com/docs/extensions/reference/';
const NUMBER_OF_PREVIOUS_SEARCHES = 4;

// Display the suggestions after user starts typing
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
    await chrome.omnibox.setDefaultSuggestion({
        description: 'Enter a Chrome API or choose from past searches'
    });
    const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
    const result = await chrome.storage.local.get('apiSuggestions');

    if (!result.apiSuggestions || !Array.isArray(result.apiSuggestions)) {
        console.error('apiSuggestions is undefined or not an array', result);
        return; // 避免继续执行
    }

    const suggestions = result.apiSuggestions.map((api) => ({
        content: api.name,
        description: `Search Chrome API: ${api.name}`
    }));

    suggest(suggestions);

    suggest(suggestions);
});

// Open the reference page of the chosen API
chrome.omnibox.onInputEntered.addListener((input) => {
    chrome.tabs.create({ url: URL_CHROME_EXTENSIONS_DOC + input });
    // Save the latest keyword
    updateHistory(input);
});

async function updateHistory(input) {
    const { apiSuggestions } = await chrome.storage.local.get('apiSuggestions');
    apiSuggestions.unshift(input);
    apiSuggestions.splice(NUMBER_OF_PREVIOUS_SEARCHES);
    return chrome.storage.local.set({ apiSuggestions });
}