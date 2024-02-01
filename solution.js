const http = require("http");
const https = require("https");

const PORT = 4000;

const BASE_URL = "https://time.com";

// extract the latest stories from html page
function extractLatestStories(html) {
    const stories = [];
// regular expression to fetch elements containing latest stories
    const regex = /<li class="latest-stories__item">(.*?)<\/li>/gs;
    let match;
    // Looping through matches in the HTML
    while ((match = regex.exec(html)) !== null) {
        const storyHtml = match[1];
         // Extracting headline and link using regular expressions
        const headlineMatch = storyHtml.match(/<h3 class="latest-stories__item-headline">(.*?)<\/h3>/);
        const linkMatch = storyHtml.match(/<a[^>]*href=['"](.*?)['"]/);

                // If both headline and link are found, add the story to the array

        if (headlineMatch && linkMatch) {
            const title = headlineMatch[1].trim();
            const link = BASE_URL + linkMatch[1].trim();
            stories.push({ title, link });
        }
    }
     // Returning the first 6 stories
    return stories.slice(0, 6);
}

const server = http.createServer((req, res) => {
    // Checking if the request is for the "/stories" endpoint and it's a GET request

    if (req.url === "/getTimeStories" && req.method === "GET") {
        const url = 'https://time.com';
 // Making an HTTPS request to the Time website
        https.get(url, (response) => {
            
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });
 // Accumulating data as it is received
            response.on('end', () => {
                const html = data;
                // finding the starting of the trending section 
                const sind = html.indexOf('<h2 class="latest-stories__heading">');
                const endind = html.indexOf('</ul>', sind);
                // extracting the latest 6 news 
                const latst_stories_html = html.substring(sind, endind + 5);
                const result = extractLatestStories(latst_stories_html);
                // creating the response 
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
