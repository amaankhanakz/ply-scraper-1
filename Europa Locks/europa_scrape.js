const puppeteer = require('puppeteer');
let xlsx = require('xlsx');

async function getdetails(url, page){
    try{
        let tech=[];
        let finish=[];

        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        
        await page.waitForTimeout(2000);
        // Name
        const prod_name = await page.$eval("div.row.mt-4.px-3.pt-3 > div.col-md-5 > h2:nth-child(1)", h2 => h2.textContent);
    
        // Code
        const code = await page.$eval("div.row.mt-4.px-3.pt-3 > div.col-md-5 > h2.font-family.mb-4", h2 => h2.textContent);
        
        // Description
        const desc = await page.$eval("div.row.mt-4.px-3.pt-3 > div.col-md-5 > p.mb-4", p => p.textContent);
        
        // Technology
        try{
            tech = await page.$eval("#technical_info > div:nth-child(2) > div.col-md-7 > p", p => p.textContent);
        }
        catch(e){}
        
        // Finish
        try{
            finish = await page.$eval("#technical_info > div:nth-child(3) > div.col-md-7 > span", span => span.textContent);
        }
        catch(e){}
        
        const color = [];
        const img = [];
        let image = [];
        const price = [];
        const img_lis = await page.$$("#demo1 > ul > li > img");
        
        
        // Color Name
        const lis = await page.$$("div.row.mt-4.px-3.pt-3 > div.col-md-5 > div.form-check-inline > label > input");
        
        try{
            for(let i =0; i<lis.length;i++){
                let k = 1;
                // Click
                // if(lis.length > 2)
                lis[i].click();
                //Image
                for(let j = 0; j< img_lis.length; j++){
                    img.push(await page.$eval(`#demo1 > ul > li:nth-child(${k}) > img`, img => img.src));
                    image = img.join(', ');
                    k++;
                }
                // Price
                price.push(await page.$eval("div.row.mt-4.px-3.pt-3 > div.col-md-5 > h2.price > span", span => span.textContent));
        
                await page.waitForTimeout((Math.floor(Math.random()*3)+1)*1000);
            }
        }
        catch(e) {}
    
        return {
            URL: url,
            Name: prod_name,
            Code: code,
            Description: desc,
            Price: price.toString(),
            // Technology: tech,
            // Finish: finish,
            Image_Link: image.toString()
        };
    }
    catch(e){}
};

async function getLinks(page){
    let links=[];
    let url="accessories_handles/Pull_Handle";

    await page.goto("https://europalocks.com/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    links = await page.$$eval('div.col-md-9 > section > ul > li.list--list-item > div > a', allAs => allAs.map(a => a.href));

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
        // if(i==0) break;
        // i++;
    }

    // To csv
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(alldata);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "Pull_Handle.xlsx");

    console.log(alldata);
    console.log("Converted to excel file");
    console.log("Done!!");

    await browser.close()
}

main();

// Code by Saksham Gupta
