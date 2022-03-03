const puppeteer = require('puppeteer');
let fs = require('fs');
let xlsx = require('xlsx');

// For marble section
async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        await page.waitForTimeout(1000);
        
        // Name
        const prod_name = await page.$eval("div.summary.entry-summary > div > h2", h2 => h2.textContent);
        
        // LOT Number
        const lot = await page.$eval("div > div:nth-child(3) > div.col-variation-val", div => div.textContent);

        // Material
        const material = await page.$eval("div.summary.entry-summary > div > div:nth-child(4) > div.col-variation-val", div => div.textContent);
        
        // Application
        const app = await page.$eval("div.summary.entry-summary > div > div:nth-child(5) > div.col-variation-val", div => div.textContent);

        // Finish
        const finish = await page.$eval("div.summary.entry-summary > div > div:nth-child(6) > div.col-variation-val", div => div.textContent);
        
        // Color
        const indi_color = await page.$eval("div.summary.entry-summary > div > div:nth-child(7) > div.col-variation-val", div => div.textContent);
        
        // Thickness
        const thickness = await page.$eval("div.summary.entry-summary > div > div:nth-child(8) > div.col-variation-val", div => div.textContent);

        //Image
        const img = await page.$eval("div.swiper-container > div > div.swiper-slide > img", img => img.src);

        return {
            URL: url,
            Name: prod_name,
            LOT_Number: lot,
            Material: material,
            Application: app.toString(),
            Finish: finish,
            Color: indi_color,
            Thickness: thickness,
            Image: img
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
    // -> set the file path at line 115 as the path of the csv to which the scraped data is to be written.
    // -> run
    
    let url = "mosaico-collection?crust-collection";
    
    await page.goto("https://www.nitco.in/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(1000);

    links = await page.$$eval('div.showroom-landing > div > div > a', allAs => allAs.map(a => a.href));

    return links;
}

async function getinnerLinks(link, page){
    let inner_links=[];

    await page.goto(link, {
        waitUntil: "load",
        timeout: 0,
    });

    await page.waitForTimeout(1000);

    inner_links = await page.$$eval('div.showroom-landing > div > div > a', allAs => allAs.map(a => a.href));

    return inner_links;
}

async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();

    const alldata = [];
    const allLinks = await getLinks(page);
    let i=0;
    
    console.log(allLinks.length);

    for(let link of allLinks){
        const inner = await getinnerLinks(link, page);
        for(let inner_link of inner){
            const data = await getdetails(inner_link,page);
            alldata.push(data);
            // if(i==1) break;
            // i++;
        }
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "granite_marble.xlsx");
    
    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta