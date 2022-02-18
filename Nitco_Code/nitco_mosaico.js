const puppeteer = require('puppeteer');
let fs = require('fs');
let xlsx = require('xlsx');

async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        await page.waitForTimeout(1000);
    
        // Name
        const prod_name = await page.$eval("div.summary.entry-summary > div > h1", h1 => h1.textContent);
    
        // Material
        const material = await page.$eval("div.summary.entry-summary > div > div:nth-child(3) > div.col-variation-val", div => div.textContent);
        
        // Application
        const app = await page.$eval("div.summary.entry-summary > div > div:nth-child(4) > div.col-variation-val", div => div.textContent);
        
        // Collection
        const collect = await page.$eval("div.summary.entry-summary > div > div:nth-child(5) > div.col-variation-val", div => div.textContent);

        // Size
        const size = await page.$eval("div.summary.entry-summary > div > div:nth-child(6) > div.col-variation-val", div => div.textContent);
        
        // Finish
        const finish = await page.$eval("div.summary.entry-summary > div > div:nth-child(7) > div.col-variation-val", div => div.textContent);
        
        // Thickness
        const thickness = await page.$eval("div.summary.entry-summary > div > div:nth-child(9) > div.col-variation-val", div => div.textContent);
        
        // Qty per Box
        const qty = await page.$eval("div.summary.entry-summary > div > div:nth-child(10) > div.col-variation-val", div => div.textContent);

        // Coverage Area
        const area = await page.$eval("div.summary.entry-summary > div > div:nth-child(11) > div.col-variation-val", div => div.textContent);
        
        
        // Color Name
        const img = [];
        const lis = await page.$$("div.clearfix.download-img-wrapper > div > div > img");
        let k = 1;
    
        for(let i =0; i<lis.length;i++){
            // Click

            // Image
            img.push(await page.$eval(`div.swiper-wrapper > div:nth-child(${k}) > img`, img => img.src));
            k++;
    
            await page.waitForTimeout((Math.floor(Math.random()*3)+1)*1000);
        }

    
        return {
            URL: url,
            Name: prod_name,
            Material: material,
            Application: app,
            Collection: collect,
            Size: size.toString(),
            Finish: finish,
            Thickness: thickness.toString(),
            Quantity: qty,
            Coverage_Area: area,
            Image: img.toString()
        };
    }
    catch(e){
        throw e;
    }
};

async function getLinks(page){
    let links=[];
    let url = "mosaico-collection?signature-collection";

    await page.goto("https://www.nitco.in/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(1000);

    links = await page.$$eval('#main > div.product-shop-listing > ul.products > li.post-422 > a', allAs => allAs.map(a => a.href));

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
        // if(i==1) break;
        // i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "signature_collection.xlsx");
    
    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta