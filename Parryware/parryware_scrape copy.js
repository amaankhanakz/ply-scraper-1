const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
let xlsx = require('xlsx');

// -> this copy is only for certain sections with no subsections
//  for example visit this section:
//  https://www.parryware.in/catalogue/products/#!/sanitaryware/pedestals

async function getdetails(url, page) {
    try {
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });

        await page.waitForTimeout(2000);
        // Name
        const prod_name = await page.$eval("div.mobile-four > div:nth-child(1) > div > div > ul > li:nth-child(2) > h2 > span", span => span.textContent);

        // FactSheet PDF
        const fact = await page.$eval("div.mobile-four > div.row > div > ul > li > a", a => a.href);

        // Code
        const code = await page.$eval("div.mobile-four > div.references > ul > li > h6", h6 => h6.innerText);

        // Color
        const color = [];
        try {
            color.push(await page.$eval("div.mobile-four > div:nth-child(8) > div > ul > li:nth-child(2) > div > p", p => p.innerText));
        }
        catch (e) {
            color.push(await page.$eval("div.mobile-four > div:nth-child(9) > div > ul > li:nth-child(2) > div > p", p => p.innerText));
        }

        // Img
        const img = await page.$eval("div.div-contenedor-ficha-producto > div > div > div:nth-child(1) > div.contenedor-gallery > div > div.swiper-container > div > div > a > img", img => img.src);

        return {
            URL: url,
            Name: prod_name,
            FactSheetPDF: fact.toString(),
            Code: code.toString(),
            Color: color.toString(),
            Image: img.toString()
        };
    }
    catch (e) {
        throw e;
    }
};

async function getLinks(page) {
    let links = [];
    try {
        if (await page.$("#product-content > div > ul > li > div > a")) {
            links = await page.$$eval('#product-content > div > ul > li > div > a', allAs => allAs.map(a => a.href));
        }
        else if (await page.$("#myForm > li > a")) {
            links = await page.$$eval('#myForm > li > a', allAs => allAs.map(a => a.href));
        }
    }
    catch (e) { }

    return links;
}

async function main() {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: false });
    const page = await browser.newPage();

    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 108 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "#!/sanitaryware/pedestals";
    await page.goto("https://www.parryware.in/catalogue/products/" + url, {
        waitUntil: "load",
        timeout: 0,
    });

    await page.waitForTimeout(5000);

    let excel_name = "";

    await page.waitForSelector("div.product-mosaic-box > div.product-mosaic > h2");
    let name = await page.$eval("div.product-mosaic-box > div.product-mosaic > h2", h2 => h2.textContent);
    name = name.replaceAll(' ', '_');

    // Change the file name here 
    excel_name = name + ".xlsx";
    excel_name = excel_name.replace(/\n/g, '');
    excel_name = excel_name.replace(/\t/g, '');
    console.log(excel_name);

    const alldata = [];
    await scrollPageToBottom(page, {
        size: 200,
        delay: 500
    })

    const allLinks = await getLinks(page);
    let i = 1;

    console.log(allLinks.length);

    for (let link of allLinks) {
        const data = await getdetails(link, page);
        alldata.push(data);
        // if(i==0) break;
        console.log("Inner" + i);
        i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, excel_name.toString());

    console.log(alldata);
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
