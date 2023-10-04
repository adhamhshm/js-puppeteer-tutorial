/*
Get screenshots full and partial
Get content from HTML
Search on https://www.algonquincollege.com/
screenshot
Fill out search input with "Mobile"
Wait for results
screenshot
Find rows where tr class is "odd" or "even"
Save td[1] td[2] td[3] and td[5] with program title and length and area
Create JSON file with list of product content
save json file with fs.writeFile(filename, (err)=>{});
*/

// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

// able to save our data to a file
import { writeFile } from 'fs';
import { error } from 'console';

const keyword = 'Mobile';

(async () => {
    const browser = await puppeteer.launch({ 
        //headless: false,
    });
    const page = await browser.newPage();

    // if we want to set a viewport, always initialize them before "goto"
    await page.setViewport({
        width: 1600,
        height: 1000,
        deviceScaleFactor: 1,
    });

    // go to the web page
    await page.goto('https://www.algonquincollege.com/');
    await page.screenshot({ path: './screenshots/scrape/algonquinhome.jpg' });

    // we want to click a serach button, wait for it to load
    const button = await page.waitForSelector('button.programSearchButton');
    // type the input in the search bar
    await page.type('input#programSearch', keyword, { delay: 100 });
    // click the search button
    await button.click();
    // wait for the page to load
    await page.waitForNavigation({ waitUntil: 'load' });
    // wait for the element we want to load
    await page.waitForSelector('table.programFilterList');
    await page.screenshot({ path: './screenshots/scrape/program-list.jpg', fullPage: true });
    // read the data from the web page results
    // we get a collection of rows -> an array data type
    const data = await page.$$eval('table.programFilterList tbody tr', (rows) => {
        return rows.map((row) => {
            if (row.classList.contains('odd') || row.classList.contains('even')) {
                const tds = row.querySelectorAll('td');
                return {
                    name: tds[1].innerText,
                    area: tds[2].innerText,
                    campus: tds[3].innerText,
                    credential: tds[4].innerText,
                    length: tds[5].innerText,
                };
            } 
            else {
                return null;
            }
        })
        .filter((row) => row);
    });
    console.log({ data });

    await writeFile('./data/coursedetails.json', JSON.stringify(data), 'utf-8', (error) => {
        if (error) throw error;
        console.log('File is saved.');
    });

    await browser.close();
})();