const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
    
        // Name
        const prod_name = await page.$eval("div.product-main-box > div.summary > h1", h1 => h1.textContent);
    
        // About
        const about = await page.$eval("div.product-main-box > div.summary > div.woocommerce-product-details__short-description > p", p => p.textContent);
        
        // Description
        const desc = [];
        const desc_lis = await page.$$("div.product-main-box > div.summary > table > tbody > tr");
        try{
            for(let j =1; j<=desc_lis.length;j++){
                desc.push(await page.$eval(`div.product-main-box > div.summary > table > tbody > tr:nth-child(${j}) > th`, th => th.innerText));
                desc.push(": ");
                desc.push(await page.$eval(`div.product-main-box > div.summary > table > tbody > tr:nth-child(${j}) > td > p`, p => p.innerText));
            }
        }
        catch(e){
            desc.push("");
        }

        const img = [];
        let image = [];
        const lis = await page.$$("div.woocommerce-product-gallery > figure > div > a");
    
        for(let i =1; i<=lis.length;i++){
            await page.waitForTimeout(1000);
            // Image
            img.push(await page.$eval(`div.woocommerce-product-gallery > figure > div:nth-child(${i}) > a`, a => a.href));
            image = img.join(', ');
        }
    
        return {
            URL: url,
            Name: prod_name,
            About: about.toString(),
            Description: desc.toString(),
            Image_Link: image.toString()
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
    // -> set the file path at line 97 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "ottavo-casa/";
    await page.goto("https://pavimentofloors.com/products/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    links = await page.$$eval('section.common-section > div.product-main-box > div.right-box > div > ul > li.product > a', allAs => allAs.map(a => a.href));

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
    xlsx.writeFile(wb, "ottavo_casa.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
