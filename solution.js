const http = require("http");
const https = require("https");

const PORT = 4000;

const BASE_URL = "https://time.com";

function extractLatestStories(html) {
    const stories = [];
    const regex = /<li class="latest-stories__item">(.*?)<\/li>/gs;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const storyHtml = match[1];
        const headlineMatch = storyHtml.match(/<h3 class="latest-stories__item-headline">(.*?)<\/h3>/);
        const linkMatch = storyHtml.match(/<a[^>]*href=['"](.*?)['"]/);
        if (headlineMatch && linkMatch) {
            const title = headlineMatch[1].trim();
            const link = BASE_URL + linkMatch[1].trim();
            stories.push({ title, link });
        }
    }
    return stories.slice(0, 6);
}

const server = http.createServer((req, res) => {
    if (req.url === "/stories" && req.method === "GET") {
        const url = 'https://time.com';

        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                const html = data;

                const startIndex = html.indexOf('<h2 class="latest-stories__heading">');
                const endIndex = html.indexOf('</ul>', startIndex);

                const latestStoriesHtml = html.substring(startIndex, endIndex + 5);
                const result = extractLatestStories(latestStoriesHtml);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result, null, 4));
            });
        }).on('error', (error) => {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
