const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(url, page) {
    try {
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });

        await page.waitForTimeout(1000);

        // Name
        const prod_name = await page.$eval("div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(2) > div > h4", h4 => h4.textContent);

        // Code
        let code = "";
        try{
            code = await page.$eval("div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(2) > div > h5", h5 => h5.innerText);
        }
        catch (e) {
            code = "";
        }
        // About
        let about = "";
        try{
            if(await page.$("body > div.header > div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(2) > div > p:nth-child(4)")){
                about = await page.$eval("body > div.header > div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(2) > div > p:nth-child(4)", p => p.innerText);
            }
            else if(await page.$("body > div.header > div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(2) > div > p")){
                about = await page.$eval("body > div.header > div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(2) > div > p", p => p.innerText);
            }
        }
        catch (e) {
            about = "";
        }

        // Image
        const img = await page.$eval("body > div.header > div.content-wrapper > div.produt-detail-outer > div > div:nth-child(1) > div:nth-child(1) > div > a", a => a.href);

        // Description
        const desc = [];
        const desc_lis = await page.$$("div > div > table > tbody > tr");
        try {
            for (let j = 1; j <= desc_lis.length; j++) {
                desc.push(await page.$eval(`div > div > table > tbody > tr:nth-child(${j}) > td:nth-child(1)`, td => td.innerText));
                desc.push(": ");
                desc.push(await page.$eval(`div > div > table > tbody > tr:nth-child(${j}) > td:nth-child(2)`, td => td.innerText));
            }
        }
        catch (e) {
            desc.push("");
        }

        return {
            URL: url,
            Name: prod_name,
            Code: code,
            About: about.toString(),
            Description: desc.toString(),
            Image: img.toString()
        };
    }
    catch (e) {
        throw(e);
    }
};

async function getLinks(page) {
    let links = [];
    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 66 as the path of the csv to which the scraped data is to be written.
    // -> run
    let url = "amulya-plus";

    await page.goto("https://www.amulyamica.com/products/" + url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(2000);

    const allEqual = arr => arr.every(v => v === arr[0])


    let prevLastItem;
    let currentLastItem;
    let tolerance = 0;
    let tolerance_arr = [0, 1, 2];
    prevLastItem = await page.$eval('div.column.product-detail-box.text-center:nth-last-child(1) > img', (item) => item.src);
    while (true) {
        await page.hover('div.footer-widget.news-widget');
        currentLastItem = await page.$eval('div.column.product-detail-box.text-center:nth-last-child(1) > img', (item) => item.src);
        if (prevLastItem === currentLastItem) {
            tolerance_arr[tolerance % 3] = currentLastItem;
            ++tolerance;
            if (allEqual(tolerance_arr)) { break; }
            await page.waitForTimeout(3000);
        }
        prevLastItem = currentLastItem;
    }

    // await scrollPageToBottom(page, {
    //     size: 400,
    //     delay: 1000
    // })

    links = await page.$$eval('#results > div > div.short-detail > a', allAs => allAs.map(a => a.href));

    return links;
}

async function main() {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: false });
    const page = await browser.newPage();

    const alldata = [];

    const allLinks = await getLinks(page);
    console.log(allLinks.length);
    let i = 1;
    for (let link of allLinks) {
        const data = await getdetails(link, page);
        alldata.push(data);
        // if (i == 3) { break; }
        console.log(i);
        i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "matt_2.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
