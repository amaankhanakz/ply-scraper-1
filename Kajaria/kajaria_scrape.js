const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(page){
    try{
        await page.waitForTimeout(1000);
        
        // Name
        const prod_name = await page.$eval("div.product > div.popup-title > div.h1", div => div.innerText);
        let name = prod_name.replaceAll('\n', '');
        name = prod_name.replace(/\s+/g, ' ').trim();
    
        // Tile Size
        let tile = "";
        try{
            tile = await page.$eval("div > div.popup-content > div > div > div > div:nth-child(1) > span", span => span.textContent);
        }
        catch(e){
            tile = "";
        }
    
        // Finish
        let finish = "";
        try{
            finish = await page.$eval("div > div.popup-content > div > div > div > div:nth-child(2) > span", span => span.textContent);
        }
        catch(e){
            finish = "";
        }
        // Technical Specs
        let tech = "";
        try{
            tech = await page.$eval("div > div.popup-content > div > div > div > div:nth-child(3) > span > a", a => a.href);
        }
        catch(e){
            tech = "";
        }

        const img = [];

        // Image
        try{
            img.push(await page.$eval("div.product > center > img", img => img.src));
        }
        catch(e){
            img.push("");
        }
        
        return {
            Name: name,
            Tile_Size: tile,
            Finish: finish,
            Technical_Specification_PDF: tech.toString(),
            Image_Link: img.toString()
        };
    }
    catch(e){
        throw e;
    }
};

async function clicktillend(page){
    await page.waitForTimeout(1000);

    let isBtnDisabled = false;
    let l = 1;
    while(!isBtnDisabled){
        try{
            await page.click("#load");
        }
        catch(e){
            const isdisabled = (await page.$("#load")) !== null;
            console.log(isdisabled);
            isBtnDisabled = isdisabled;
        }
        console.log("Load "+ l);
        l=l+1;
        // if(l==4) break;
        await page.waitForTimeout(2000);
    }
}

async function main(){
    const browser = await puppeteer.launch({defaultViewport: false, args:[
        '--start-maximized'
    ]});
    const page = await browser.newPage();

    let url = "eternity-glazed-vitrified-tiles.php";

    await page.goto("https://www.kajariaceramics.com/"+url, {
        waitUntil: "load",
        timeout: 0,
    });
    await page.waitForTimeout(2000);

    const alldata = [];
    await clicktillend(page);
    await page.waitForTimeout(2000);
    allLinks = await page.$$("#result_para > div > article");

    console.log(allLinks.length);
    for(let i=0; i<allLinks.length; i++) {
        const data = await getdetails(page);
        alldata.push(data);
        // if(i==3) break;
        console.log(i+1);
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "wall_mount.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
