/*
Do a search on unsplash.com
Read search term from CLI and create folder
Get copies of the images from the search results
Save them locally in a folder named after search terms 
Get screenshot save in "screens" folder filename search term .png
*/

import puppeteer from 'puppeteer';
import { writeFile } from 'fs';
const searchTermCLI = process.argv.length >= 3 ? process.argv[2] : 'Mountains';

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false 
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 1000,
        deviceScaleFactor: 1,
    });

    // It sets up an event listener for the 'response' event on the page.
    // When a response is received from a network request, this event listener will be triggered.
    page.on('response', async (resp) => {
        // extracts the response headers and the URL of the response.
        const headers = resp.headers();
        const url = new URL(resp.url());
        // It checks if the 'content-type' header includes 'image/avif' and 
        // if the URL starts with 'https://images.unsplash.com/photo-' and 
        // if the 'content-length' is greater than 30000 bytes (30KB).
        if (headers['content-type']?.includes('image/avif') && url.href.startsWith('https://images.unsplash.com/photo-') && headers['content-length'] > 30000) {
            // If these conditions are met, it logs the URL pathname (the part of the URL after the domain).    
            console.log(url.pathname);
            // there will a buffer data inside the response 
            // It then extracts the binary data from the response using resp.buffer().
            // It writes this binary data to a file in the './images/' directory with 
            // a filename based on the URL pathname, appending '.jpg' to it.
            await resp.buffer().then(async (buffer) => {
                await writeFile(`./images/${url.pathname}.jpg`, buffer, (error) => {
                    if (error) throw error;
                });
            });
        }
    });

    await page.goto('https://www.unsplash.com/');
    await page.screenshot({ path: './screenshots/download/unsplashhome.jpg' });
    //'input[data-test="nav-bar-search-form-input"]'
    //'button[data-test="nav-bar-search-form-button"]'

    // waits for the 'button' element with the attribute 'data-test="nav-bar-search-form-button"' to appear.
    const button = await page.waitForSelector('button[data-test="nav-bar-search-form-button"]');
    // waits for the 'input' element with the attribute 'data-test="nav-bar-search-form-input"' to appear on the page.
    await page.type('input[data-test="nav-bar-search-form-input"]', searchTermCLI);

    await Promise.all([
        page.waitForNavigation(), 
        button.click(),
    ]);
    // waits for the page to navigate and for the network to become idle.
    await page.waitForNetworkIdle();
    await page.screenshot({ path: './screenshots/download/unsplash-search.jpg', fullPage: true });

    await browser.close();
})();