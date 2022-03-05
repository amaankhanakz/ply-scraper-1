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
        const prod_name = await page.$eval("#overview > div > div > div > div > div.content > h1", h1 => h1.textContent);
    
        // Description
        const desc = await page.$eval("#mCSB_1_container", div => div.innerText);
        
        const img = [];
        const available = [];
        let image = [];
        const lis = await page.$$("div.content > div.image-thmbs > button.tablinks");
        const avail_lis = await page.$$("section.block-usp > div > ul > li");
    
        for(let i =1; i<=lis.length;i++){
            await page.waitForTimeout(1000);
            // Image
            img.push(await page.$eval(`#thumb${i} > span > img`, img => img.src));
            image = img.join(', ');
        }
        try{
            for(let j =1; j<=avail_lis.length;j++){
                available.push(await page.$eval(`section.block-usp > div > ul > li:nth-child(${j})`, li => li.textContent));
            }
        }
        catch(e){
            available.push("");
        }
    
        return {
            URL: url,
            Name: prod_name,
            Available_In: available.toString(),
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
    // -> set the file path at line 94 as the path of the csv to which the scraped data is to be written.
    // -> run

    let url = "centurydoors?cp_cat=decorative-doors";
    await page.goto("https://www.centuryply.com/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(2000);

    links = await page.$$eval('div.product-listsection > div > div.desktopshowns > div > div > div.cta-varioussets > a:nth-child(1)', allAs => allAs.map(a => a.href));
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
    xlsx.writeFile(wb, "decorative_doors.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
