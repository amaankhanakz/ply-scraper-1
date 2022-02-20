const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });

        await page.waitForTimeout(2000);

        // Name
        const prod_name = await page.$eval("div.col-summary > div > h1", h1 => h1.textContent);

        let code = "";
        let price = "";
        const about = [];
        
        try{
            // Code
            code = await page.$eval("div.product_meta > span.sku_wrapper > span", span => span.textContent);
        }
        catch(e){
            code ="";
        }
        
        try{
            // Price
            price = await page.$eval("div.vgwc-product-price > ins > span > bdi", bdi => bdi.textContent);
        }
        catch(e){
            price ="";
        }
        
        try{
            // About
            aboutlist = await page.$$("div.short-description > p");
            for(let z=1; z<=aboutlist.length;z++){
                about.push(await page.$eval(`div.short-description > p:nth-child(${z})`, p => p.textContent));
            }
        }
        catch(e){
            about.push("");
        }
    
        // Price
        // const price = await page.$eval("#koh-page-outer > div > div.koh-page > section > div.koh-product-top-row > div.koh-product-details > div.koh-product-skus-colors > ul > li > span", span => span.textContent);
        
        const img = [];
        try{
            // Image
            img.push(await page.$eval("div.col-xs-12.col-md-5 > div > div > figure > div > a", a => a.href));
        }
        catch(e){
            img.push(await page.$eval("div.col-xs-12.col-md-5 > div > div > div > figure > div.woocommerce-product-gallery__image.flex-active-slide > a", a => a.href));
            
        }
        
        // Color Name
        const desc = [];
        const lis = await page.$$("#tab-description > ul > li > span");
        let k = 1;
    
        for(let i =0; i<lis.length;i++){
            // Click
            // if(lis.length > 2)
                // lis[i].click();

            try{
                // Description
                desc.push(await page.$eval(`#tab-description > ul:nth-child(${k}) > li > span`, span => span.innerText));
                k++;
            }
            catch(e){
                desc.push(" ");
            }
    
            // await page.waitForTimeout((Math.floor(Math.random()*3)+1)*1000);
        }
    
        return {
            URL: url,
            Name: prod_name,
            Code: code,
            Price: price.toString(),
            About: about.toString(),
            // Description: desc.toString(),
            Image_Link: img.toString()
        };
    }
    catch(e){
        throw(e);
    }
};

async function getLinks(page){
    let links=[];
    let url ="induction-and-cookware/";

    await page.goto("https://www.kutchina.com/product-category/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    links = await page.$$eval('div.item-col > div > div > div.list-col4 > div > a', allAs => allAs.map(a => a.href));

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

    console.log(alldata);
    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "induction_and_cookware.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
