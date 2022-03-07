const puppeteer = require('puppeteer');
let fs = require('fs');
let xlsx = require('xlsx');

async function getdetails(next, page){
    try{
        // await page.waitForTimeout(1000);
    
        // Name
        const prod_name = await page.$eval("#content_rptProductList_lnkViewProduct_"+next+" > div > figure > div.lower-content > div > h3", h3 => h3.textContent);
        
        // Image
        const img = await page.$eval("#content_rptProductList_lnkViewProduct_"+next+" > div > figure > div.image-box > img", img => img.src);
    
        return {
            Name: prod_name,
            Image: img.toString()
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
    // -> set the file path at line 66 as the path of the csv to which the scraped data is to be written.
    // -> run
    let url = "productlist.aspx?sctmid=kgygTtWQEbHowM8ALe9a9Q%3d%3d";

    await page.goto("https://www.kohinoortiles.com/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(2000);

    links = await page.$$('div.product-block');

    return links;
}


async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();

    const alldata = [];
    const allLinks = await getLinks(page);
    console.log(allLinks.length);
    let i=1;
    let next =0;
    for(let j=0; j<allLinks.length; j++){
        const data = await getdetails(next, page);
        alldata.push(data);
        next++;
        console.log(next);
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
