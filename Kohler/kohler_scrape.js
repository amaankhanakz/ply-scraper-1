const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
    
        // Name
        const prod_name = await page.$eval(".koh-product-short-description", div => div.textContent);
    
        // Code
        const code = await page.$eval(".koh-product-skus-colors .koh-product-sku", span => span.textContent);
    
        // Price
        const price = await page.$eval("#koh-page-outer > div > div.koh-page > section > div.koh-product-top-row > div.koh-product-details > div.koh-product-skus-colors > ul > li > span", span => span.textContent);
        
        // Color Name
        const color = [];
        const img = [];
        const lis = await page.$$(".koh-product-colors > ul > li > span");
    
        for(let i =0; i<lis.length;i++){
            // Click
            lis[i].click();

            await page.waitForTimeout(1000);
            // Color
            color.push(await page.$eval(".koh-product-colors > span.koh-product-colors-selected", span => span.innerText));
            // Image
            img.push(await page.$eval("img.koh-product-iso-image", img => img.src));
    
            await page.waitForTimeout((Math.floor(Math.random()*3)+1)*1000);
        }
    
        return {
            URL: url,
            Name: prod_name,
            Code: code,
            Price: price.toString(),
            Color_Name: color.toString(),
            Image_Link: img.toString()
        };
    }
    catch(e){
        throw e;
    }
};

async function getLinks(page){
    let links=[];
    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 93 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "Kitchen/Kitchen+Faucets/Product+Type/Wall+Mount";
    await page.goto("https://www.kohler.co.in/browse/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    links = await page.$$eval('.koh-product-tile-inner .koh-product-tile-content a', allAs => allAs.map(a => a.href));

    return links;
}


async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();

    const alldata = [];
    const allLinks = await getLinks(page);
    let i=0;
    
    console.log(allLinks.length);

    for(let link of allLinks){
        const data = await getdetails(link,page);
        alldata.push(data);
        // if(i==3) break;
        // i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "wall_mount.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
