const libraryUrl = 'https://library.penguinmod.com/files/emojis';
let lastFetchResult = "";
let lastFetchTime = 0;

const getHtmlResponse = async () => {
    if (Date.now() - lastFetchTime > 30000) {
        // its been 30s, refetch list
        const response = await fetch(libraryUrl);
        const htmle = await response.text();

        lastFetchResult = htmle;
        lastFetchTime = Date.now();

        return htmle;
    } else {
        return lastFetchResult;
    }
};

module.exports = async (_, res) => {
    try {
        const htmle = await getHtmlResponse();
        const emojis = htmle
            .substring(htmle.indexOf('</header><ul id=files>') + 22, htmle.indexOf('</ul></main>'))
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0) // remove blank lines
            .filter(line => line.endsWith('.png</a>')) // remove .txt file
            .map(emoji => {
                const cut = emoji.substring(22);
                const final = cut.substring(cut.indexOf('>') + 1, cut.indexOf('.png</a>'))
                return final;
            });

        if (!Array.isArray(emojis)) throw new Error('Emojis did not result in array');

        res.status(200)
            .json(emojis);
    } catch (e) {
        res.status(400)
            .json({
                error: String(e)
            });
    }
};