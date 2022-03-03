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
        const prod_name = await page.$eval("div.fusion-page-title-captions > h1", h1 => h1.textContent);
    
        // Design
        const desg_list = await page.$$("div.project-content > div > p");
        
        console.log(desg_list.length);
        const design=[];
        let k=2;
        for(let j = 1; j< desg_list.length; j++){
            try{
                design.push(await page.$eval(`div.project-content > div > p:nth-child(${k})`, p => p.innerText));
                console.log(design);
            }
            catch(e){
                throw(e);
            }
            k++;
        }
    
        // Image
        
        const img = [];
        try{
            img.push(await page.$eval("div.fusion-flexslider.flexslider.fusion-post-slideshow.post-slideshow > ul.slides > li > img", img => img.src));  
        }
        catch(e){}
    
        return {
            URL: url,
            Name: prod_name,
            Design: design.toString(),
            Image_Link: img.toString()
        };
    }
    catch(e){
        throw e;
    }
};

async function getLinks(url, page){
    let links=[];
    await page.goto(url, {
        waitUntil: "load",
        timeout: 0,
    });

    links = await page.$$eval('div.fusion-portfolio-wrapper > article > div > div.fusion-image-wrapper > div > div > a', allAs => allAs.map(a => a.href));

    return links;
}

async function pageLink(page){
    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at `line 117` as the path of the csv to which the scraped data is to be written.
    // -> run
    let url = "portfolio_category/airolam/";
    await page.goto("https://airolam.com/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    const pageLs = [];
    let i=1;
    pageLs.push(await page.url());
    // Loop through the pages
    while(i<13){
        await page.click("#content > div > div.pagination.clearfix > a.pagination-next > span.page-text");
        await page.waitForTimeout(1000);
        pageLs.push(await page.url());
        await page.waitForTimeout(1000);
        
        i++;
    }
    return pageLs;
}

async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();

    const alldata = [];
    const allpages= await pageLink(page);
    let i=0;
    for(let pages of allpages){
        // if(i==1) break;
        // i++;
        const allLinks = await getLinks(pages, page);
        
        console.log(allpages.length);
        console.log(allLinks.length);
        
        for(let link of allLinks){
            const data = await getdetails(link,page);
            alldata.push(data);
        }
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    // Change the file path here
    xlsx.writeFile(wb, "airolam.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
