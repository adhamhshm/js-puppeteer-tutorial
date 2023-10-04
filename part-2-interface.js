/*
test interactions with a form and ui elements
https://youtube.com/
Get a screenshot and a blurred screenshot
Complete and submit the search form with value from cli or env
'#search-input #search' and '#search-icon-legacy'
screenshot of search results
output text from firstMatch 'ytd-video-renderer h3 a#video-title'
click on firstMatch, navigate
click on dismiss button for login '#dismiss-button'
wait for and check number of comments `ytd-comments-header-renderer h2`
screenshot of video playing
get text for first suggested 'ytd-compact-video-renderer'
output comment count and first suggested video title
tips: use v19.5
*/

import puppeteer from 'puppeteer';

// get the search term from the command line -> run node part-2-interface.js "Cars"
// [0]  [1]                 [2] 
// node part-2-interface.js "Cars" -> note the array of the command
// that is why we use "3"
const searchTermCLI = process.argv.length >= 3 ? process.argv[2] : 'Volbeat';

// NOTE: did not work :(
// get the search term using env variable -> run set SEARCHTEXT="Cars" (for windows)
// we will then created the variable, set/echo %SEARCHTXT% (for windows)
const searchTermENV = process.env.SEARCHTEXT ?? 'Volbeat';

(async () => {
    const browser = await puppeteer.launch({ 
        // headless: false, 
        defaultViewport: false,
        args:[
            "--start-maximized" // you can also use '--start-fullscreen'
        ],
    });
    const page = await browser.newPage();

    // to set the width and height of the browser
    // await page.setViewport({
    //     width: 1800,
    //     height: 1000,
    //     deviceScaleFactor: 1,
    // });

    // open Youtube page
    await page.goto('https://www.youtube.com/');
    // wait for the selector that we want to exist first
    await page.waitForSelector('#search-input #search');
    // insert the search value, delay when typing for each character
    await page.type('#search-input #search', searchTermCLI, { delay: 100 });
    // make the page blurred
    await page.emulateVisionDeficiency('blurredVision');
    await page.screenshot({ path: './screenshots/interface/youtube-homeblurred.jpg' });
    // make the page unblurred
    await page.emulateVisionDeficiency('none');
    await page.screenshot({ path: './screenshots/interface/youtube-home.jpg' });

    // wait for the page to load, then click the icon/button
    await Promise.all([
        page.waitForNavigation(), 
        page.click('#search-icon-legacy')
    ]);

    //wait till next page
    await page.waitForSelector('ytd-video-renderer h3 a#video-title');
    await page.screenshot({ path: './screenshots/interface/search-results.jpg' });

    // get the video title
    // "$" for an item, "$$" for every items
    const firstMatch = await page.$eval('ytd-video-renderer h3 a#video-title', (element) => {
        // runs when that a#video-title is found
        return element.innerText;
    });
    console.log({ firstMatch });

    try {
        // wait for the page to load, then click play video
        await Promise.all([
            page.waitForNavigation(), //waitForNetworkIdle()
            page.click('ytd-video-renderer h3 a#video-title'),
            // add some delay with specified time
            new Promise((resolve) => setTimeout(resolve, 17000)),
        ]);
        // screenshot first video
        await page.screenshot({ path: './screenshots/interface/first-video.jpg' });
    } 
    catch (error) {
        console.log("Error finding the video.");
    }

    try {
        // wait for the total number of comments header to load
        await page.waitForSelector('ytd-comments-header-renderer');
        // get the number of comments
        const videoComments = await page.$eval('ytd-comments-header-renderer h2', (h2) => {
            return h2.innerText;
        });
        console.log({ videoComments });
    }
    catch (error) {
        console.log("Comment might have been disabled for the video.");
    }

    // get the title of the first suggested video
    const firstSuggested = await page.$eval('ytd-compact-video-renderer', (element) => {
        return element.querySelector('h3').innerText;
    });
    console.log({ firstSuggested });

    await browser.close();
})();