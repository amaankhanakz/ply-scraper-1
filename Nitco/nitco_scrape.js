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
        const prod_name = await page.$eval(".product_title", h1 => h1.textContent);
    
        // Material
        const material = await page.$eval(".product-details > div.group-variation div.col-variation-val", div => div.textContent);
        
        // Application
        const app = await page.$eval("div.summary.entry-summary > div > div:nth-child(4) > div.col-variation-val", div => div.textContent);
        
        // Collection
        const collect = await page.$eval("div.summary.entry-summary > div > div:nth-child(5) > div.col-variation-val", div => div.textContent);

        // Size
        const size = await page.$eval("div.summary.entry-summary > div > div:nth-child(6) > div.col-variation-val", div => div.textContent);
        
        // Looks
        const look = await page.$eval("div.summary.entry-summary > div > div:nth-child(7) > div.col-variation-val", div => div.textContent);
        
        // Finish
        const finish = await page.$eval("div.summary.entry-summary > div > div:nth-child(8) > div.col-variation-val", div => div.textContent);
        
        // Color
        const indi_color = await page.$eval("div.summary.entry-summary > div > div:nth-child(9) > div.col-variation-val", div => div.textContent);
        
        // Quantity
        const qty = await page.$eval("div.product-banner > div > div.row.pt-30 > div.summary.entry-summary > div > div:nth-child(10) > div.col-variation-val", div => div.textContent);
        
        // Coverage Area
        const area = await page.$eval("div.summary.entry-summary > div > div:nth-child(11) > div.col-variation-val", div => div.textContent);
        
        // Color Variation
        const color_var = await page.$eval("div.summary.entry-summary > div > div:nth-child(12) > div.col-variation-val", div => div.textContent);
        
        // Color Name
        const img = [];
        const lis = await page.$$("div.clearfix.download-img-wrapper > div > div > img");
        let k = 1;
    
        for(let i =0; i<lis.length;i++){
            // Click

            // Image
            img.push(await page.$eval(`div.swiper-wrapper > div:nth-child(${k}) > img`, img => img.src));
            k++;
    
            await page.waitForTimeout(1000);
        }

    
        return {
            URL: url,
            Name: prod_name,
            Material: material,
            Application: app,
            Collection: collect,
            Size: size,
            Looks_Like: look,
            Finish: finish,
            Color: indi_color,
            Quantity: qty,
            Coverage_Area: area,
            Color_Variation: color_var,
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
    // -> set the file path at line 127 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "bathroom-tiles-collection";

    await page.goto("https://www.nitco.in/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(1000);

    links = await page.$$eval('ul.products div#prodlist li.type-product a', allAs => allAs.map(a => a.href));

    return links;
}


async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();

    const alldata = [];
    const allLinks = await getLinks(page);
    let i=1;
    
    console.log(allLinks.length);
    
    for(let link of allLinks){
        const data = await getdetails(link,page);
        alldata.push(data);
        // if(i==1) break;
        console.log(i);
        i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "bathroom_tiles.xlsx");
    
    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
