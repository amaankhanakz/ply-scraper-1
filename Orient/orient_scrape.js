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
        const prod_name = await page.$eval("#product-main-info > div > div > h1", h1 => h1.textContent);
    
        // Description
        const desg_list = await page.$$("#produt-top-area > div.product-content > div:nth-child(4) > div.product-head-section > div > ul > li");

        const desc=[];
        let d = "";
        for(let j = 1; j<= desg_list.length; j++){
            try{
                desc.push(await page.$eval(`#produt-top-area > div.product-content > div:nth-child(4) > div.product-head-section.short-attr-info > div > ul > li:nth-child(${j})`, li => li.innerText));
            }
            catch(e){
                throw(e);
            }
        }

        const img = [];
        let image = [];

        // Image
        const lis = await page.$$("div.pr-thumbs > div > div > div.slick-slide > div > div > img");
        
        try{
            for(let i =0; i<lis.length;i++){
                // Click
                await page.waitForSelector("div.pr-thumbs > div > div > div.slick-slide > div > div > img", {visible: true, timeout: 7000 });
                lis[i].click();
                img.push(await page.$eval(`figure > img`, img => img.src));
                image = img.join(', ');
                await page.waitForTimeout(1000);
            }
        }
        catch(e) {
            
        }
    
        return {
            URL: url,
            Name: prod_name,
            Description: desc.toString(),
            Image_Link: image.toString()
        };
    }
    catch(e){
        return {
            URL: "",
            Name: "",
            Description: "",
            Image_Link: ""
        };
    }
};

async function getLinks(page){
    let links=[];

    links = await page.$$eval('#amasty-shopby-product-list > div.myproductbox > div > a.list-image-wrap', allAs => allAs.map(a => a.href));

    return links;
}

async function clicktillEnd(page){
    // this method will return true if the button is displayed and false if it is not.
    const isBtnVisible = async (page, cssSelector) => {
        let visible = true;
        await page
        .waitForSelector(cssSelector, { visible: true, timeout: 7000 })
        .catch(() => {
            visible = false;
        });
        return visible;
    };
    let i = 1;
    let selectorForLoadMoreButton = "#load-more-product-link > span";
    // This will continually check for if the button is visible in your UI, click it if it is displayed and then repeat the process until the button is no longer displayed.
    let loadMoreVisible = await isBtnVisible(page, selectorForLoadMoreButton);
    while (loadMoreVisible) {
        await page.waitForTimeout(4000);
        await page
        .click(selectorForLoadMoreButton)
        .catch(() => {});
        loadMoreVisible = await isBtnVisible(page, selectorForLoadMoreButton);
        console.log(i);
        i++;
    }
}

async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false, args:[
        '--start-maximized'
    ]});
    const page = await browser.newPage();

    const alldata = [];
    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 134 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "floor-tiles";
    await page.goto("https://www.orientbell.com/tiles/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(2000);

    await clicktillEnd(page);
    await page.waitForTimeout(4000);
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
    xlsx.writeFile(wb, "floor_tiles.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
