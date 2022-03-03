const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
let xlsx = require('xlsx');

// -> this is for sections with subsections

async function getdetails(url, page){
    try{

        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        
        await page.waitForTimeout(2000);
        // Name
        const prod_name = await page.$eval("div.summary > h1", h1 => h1.textContent);
    
        // About
        const about = await page.$eval("div.summary.entry-summary > div.woocommerce-product-details__short-description > p", p => p.textContent);
        
        // Description
        const desg_list = await page.$$("div.summary.entry-summary > table > tbody > tr");

        const desc=[];
        let k=1;
        for(let j = 1; j< desg_list.length; j++){
            try{
                desc.push(await page.$eval(`div.summary.entry-summary > table > tbody > tr:nth-child(${k})`, tr => tr.innerText));
            }
            catch(e){
                throw(e);
            }
            k++;
        }

        const img = [];
        let image = [];

        // Image
        const lis = await page.$$("div.woocommerce-product-gallery > figure > div > div > div.slider-nav > div > div > div.item-slick > img");
        
        try{
            for(let i =0; i<lis.length;i++){
                // Click
                lis[i].click();
                img.push(await page.$eval(`div.woocommerce-product-gallery > figure > div > div > div.slider-for > div > div > a.item-slick > img`, img => img.src));
                image = img.join(', ');
                await page.waitForTimeout(1000);
            }
        }
        catch(e) {
            throw e;
        }
    
        return {
            URL: url,
            Name: prod_name,
            About: about,
            Description: desc.toString(),
            Image_Link: image.toString()
        };
    }
    catch(e){
    }
};

async function getLinks(page){
    let links=[];

    links = await page.$$eval('#main > ul > li.product> a', allAs => allAs.map(a => a.href));

    return links;
}

async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();

    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 108 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url="digital-collection-laminate/";
    await page.goto("https://www.deltalaminates.in/products/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    await page.waitForTimeout(3000);

    const allmainlinks = await getLinks(page);
    let m=1;
    console.log(allmainlinks.length);
    for(let mainlink of allmainlinks){
        const excel_name = [];
        
        await page.goto(mainlink, {
            waitUntil: "load",
            timeout: 0,
        });
        await page.waitForTimeout(2000);

        try{
            // Change the file name here 
            excel_name.push("digital_"+m+".xlsx");
        }
        catch(e){}

        const alldata = [];
        await scrollPageToBottom(page, {
            size: 200,
            delay: 500
        })
    
        const allLinks = await getLinks(page);
        let i=1;
        
        console.log(allLinks.length);
    
        for(let link of allLinks){
            const data = await getdetails(link,page);
            alldata.push(data);
            // if(i==0) break;
            console.log("Inner"+i);
            i++;
        }
    
        // To csv
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(alldata);
        xlsx.utils.book_append_sheet(wb, ws);
        xlsx.writeFile(wb, excel_name.toString());
    
        console.log(alldata);
        console.log("Done!!"+m);
        console.log("Outer"+m);
        m++;
    }


    await browser.close()
}

main();

// Code by Saksham Gupta