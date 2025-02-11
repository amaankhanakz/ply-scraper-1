const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

// This copy is for sections without sub sections

async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        
        await page.waitForTimeout(3000);
        // Name
        const prod_name = await page.$eval("#gw-group-hero-gallery-product-autofill-07ac424a70 > section > div > div.styles__Head-sc-kyp1cx-5.cxkwzk > div > h1", h1 => h1.textContent);
    
        // Features
        const feat_list = await page.$$("#gw-group-hero-gallery-product-autofill-07ac424a70 > section > div > div.styles__Content-sc-kyp1cx-4.kThHz > div.styles__RichTextFoldout-sc-1ehsqfp-0.gbxqXT > div > div > div > ul > li");
        
        console.log(feat_list.length);
        const feature=[];
        let k=1;
        for(let j = 0; j< feat_list.length; j++){
            feature.push(await page.$eval(`div.styles__RichTextFoldout-sc-1ehsqfp-0.gbxqXT > div > div > div > ul > li:nth-child(${k}) > span`, span => span.textContent));
            k++;
        }
        
        // Image
        const img = [];
        const lis = await page.$$("#image-gallery > ul > li > div");
    
        for(let i =1; i< 2;i++){
            // Click
            // if(lis.length > 2)
            // lis[i].click();

            // img.push(await page.$eval(`#image-gallery > ul > li:nth-child(${i}) > div > div > div.styles__Image-sc-175nep1-1 > img.styles__FullImage-sc-175nep1-2`, img => img.src));
            
            img.push(await page.$eval("#image-gallery > div > div > div > div.styles__Image-sc-175nep1-1.hYUUbQ > img.styles__FullImage-sc-175nep1-2.eIinwf", img => img.srcset));
    
            await page.waitForTimeout((Math.floor(Math.random()*2)+1)*1000);
        }
    
        return {
            URL: url,
            Name: prod_name,
            Features: feature.toString(),
            Image_Link: img.toString()
        };
    }
    catch(e){
        throw e;
    }
};

async function getLinks(page){
    let links=[];

    links = await page.$$eval('section.styles__Products-sc-1lgfhtx-2 > ul > li > article > div.styles__LinkWrapper-sc-qdv3hi-3 > a', allAs => allAs.map(a => a.href));

    return links;
}

async function clicktillEnd(page){
    await page.waitForTimeout(1000);

    let isBtnDisabled = false;
    while(!isBtnDisabled){
        try{
            await page.click("button.styles__Button-sc-vn6aom-0.eNmiyT");
        }
        catch(e){
            const isdisabled = (await page.$("button.styles__Button-sc-vn6aom-0.RWpJt")) !== null;
            isBtnDisabled = isdisabled;
        }
    }
}

async function cookie(page){
    // usage:
    // -> npm install puppeteer --save
    // -> just set `url` according to the section that is to be scraped.
    // -> set the file path at line 123 as the path of the csv to which the scraped data is to be written.
    // -> run
    let url ="glass-architectural-hardware/glazing-profile1";

    await page.goto("https://www.enox.in/in/en/products/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    await page.waitForTimeout(2000);
    await page.waitForSelector("#onetrust-banner-sdk > div > div");
    try{
        await page.click("#onetrust-accept-btn-handler");
    }
    catch(e){}
}

async function main(){
    const browser = await puppeteer.launch({headless: false, defaultViewport: false});
    const page = await browser.newPage();
    const alldata = [];

    await cookie(page);
    await clicktillEnd(page);
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
    xlsx.writeFile(wb, "Glazing_Profile.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta