// Puppeteer and Headless Chrome (or Firefox)
// npm init -y
// add "type":"module" to package.json
// npm install puppeteer

import puppeteer from 'puppeteer';

(async () => {

    // open the browser
    const browser = await puppeteer.launch({ 
        headless: false,
    });

    // create a tab inside the browser
    const page = await browser.newPage();

    // set the browser window properties
    await page.setViewport({ 
        width: 1600, 
        height: 1000, 
        isMobile: false, 
        isLandscape: true, 
        hasTouch: false, 
        deviceScaleFactor: 1, 
    });

    // like saying, hey! this is where i am
    await page.setGeolocation({ 
        latitude: 49.5, 
        longitude: 100.0 
    });

    // navigate to the given url
    await page.goto('https://chapters.indigo.ca/');

    // get the url of the page
    const url = await page.url();
    console.log(url);

    // get the source code of the page
    const content = await page.content();
    console.log(content);

    // get the screenshot of the page
    await page.screenshot({ path: './screenshots/basic/samplechapters1.jpg', fullPage: true });

    // the clip is to customize the size of the screenshot
    await page.screenshot({ path: './screenshots/basic/samplechapters2.jpg', clip: { x: 200, y: 200, width: 500, height: 500 }, encoding: 'binary', type: 'jpeg' });

    // await page.type('input.selector', 'text');
    // await page.waitForSelector('.someselector')

    // close the browser
    await browser.close();
})();