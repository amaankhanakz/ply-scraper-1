const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        await page.waitForTimeout(1000);
        
        // Name
        const prod_name = await page.$eval("div.c-shop-product-details-2 > div:nth-child(1) > div:nth-child(2) > div > div.c-content-title-1 > h3", h1 => h1.textContent);
    
        // Description
        const desg_list = await page.$$("div.c-shop-product-details-2 > div:nth-child(1) > div:nth-child(2) > div > div.row.c-product-variant > div > p");

        const desc=[];
        let k=1;
        for(let j = 1; j< desg_list.length; j++){
            try{
                desc.push(await page.$eval(`div.c-shop-product-details-2 > div:nth-child(1) > div:nth-child(2) > div > div.row.c-product-variant > div:nth-child(${k}) > p`, p => p.innerText));
            }
            catch(e){
                throw(e);
            }
            k++;
        }
        
        // Image
        const img = [];
        img.push(await page.$eval("#singleimage > div > div.c-content-isotope-item.c-isotope-photo > div > img", img => img.src));
    
        return {
            URL: url,
            Name: prod_name,
            Description: desc.toString(),
            Image_Link: img.toString()
        };
    }
    catch(e){
        // return {
        //     URL: "",
        //     Name: "",
        //     Description: "",
        //     Image_Link: ""
        // };
    }
};

async function getLinks(page){
    let links=[];
    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 94 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "filterProducts?virtualclass=Laminates%20For%20TV%20Cabinet"
    await page.goto("http://www.royalcrownlaminates.com/Category/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(1000);

    links = await page.$$eval('#demo > div > div > div.c-info > a', allAs => allAs.map(a => a.href));

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
        // if(i==3) break;
        console.log(i);
        i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "virtualclass_tv.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
