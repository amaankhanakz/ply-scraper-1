const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
let xlsx = require('xlsx');


async function getdetails(url, page){
    try{
        await page.goto(url, {
            waitUntil: "load",
            timeout: 0,
        });
        
        await page.waitForTimeout(2000);
        // Name
        const prod_name = await page.$eval("div.mobile-four > div:nth-child(1) > div > div > ul > li:nth-child(2) > h2 > span", span => span.textContent);
    
        // FactSheet PDF
        const fact = await page.$eval("div.mobile-four > div.row > div > ul > li > a", a => a.href);
        
        // Code
        const code = await page.$eval("div.mobile-four > div.references > ul > li > h6", h6 => h6.innerText);
        
        // Color
        const color = [];
        try{
            if((await page.$("div.mobile-four > div:nth-child(9) > div > ul")) || (await page.$("div.mobile-four > div:nth-child(8) > div > ul"))){
                let color_list = "";
                try{
                    color_list = await page.$$("div.mobile-four > div:nth-child(9) > div > ul > li > div > p");
                }
                catch(e){
                    color_list = await page.$$("div.mobile-four > div:nth-child(8) > div > ul > li > div > p");
                }
                for(let y=1; y<=color_list.length; y++){
                    try{
                        color.push(await page.$eval(`div.mobile-four > div:nth-child(8) > div > ul > li:nth-child(${(y+1)}) > div > p`, p => p.innerText));
                    }
                    catch(e){
                        color.push(await page.$eval(`div.mobile-four > div:nth-child(9) > div > ul > li:nth-child(${(y+1)}) > div > p`, p => p.innerText));
                    }
                }
            }
        }
        catch(e){}

        const about =[];
        try{
            if(await page.$("div.div-contenedor-ficha-producto > div > div > div.mobile-four > div:nth-child(5) > div > div:nth-child(1) > div > ul")){
                const about_list = await page.$$("div.mobile-four.div-two-part.columns.datasheet > div:nth-child(5) > div > div > div > ul.lista-atributos > li");
                for(let z=1;z<=about_list.length;z++){
                    about.push(await page.$eval(`div.mobile-four.div-two-part.columns.datasheet > div:nth-child(5) > div > div > div > ul.lista-atributos > li:nth-child(${z})`, li => li.innerText));
                }
            }
        }
        catch(e){}
        
        // Img
        const img = await page.$eval("div.div-contenedor-ficha-producto > div > div > div:nth-child(1) > div.contenedor-gallery > div > div.swiper-container > div > div > a > img", img => img.src);
        
        return {
            URL: url,
            Name: prod_name,
            About: about.toString(),
            FactSheetPDF: fact.toString(),
            Code: code.toString(),
            Color: color.toString(),
            Image: img.toString()
        };
    }
    catch(e){
        throw e;
    }
};

async function getLinks(page){
    let links=[];
    try{
        if(await page.$("#product-content > div > ul > li > div > a")){
            links = await page.$$eval('#product-content > div > ul > li > div > a', allAs => allAs.map(a => a.href));   
        }
        else if(await page.$("#myForm > li > a")){
            links = await page.$$eval('#myForm > li > a', allAs => allAs.map(a => a.href));
        }
    }
    catch(e){}

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

    let url="#!/flushing-cistern-seat-covers/polymer-cister";
    await page.goto("https://www.parryware.in/catalogue/products/"+url, {
        waitUntil: "load",
        timeout: 0,
    });

    await page.waitForTimeout(5000);

    const allmainlinks = await getLinks(page);
    let m=1;
    console.log(allmainlinks.length);
    for(let mainlink of allmainlinks){
        let excel_name = "";
        
        await page.goto(mainlink, {
            waitUntil: "load",
            timeout: 0,
        });
        await page.waitForTimeout(6000);
        await page.waitForSelector("div.product-mosaic-box > div.product-mosaic > h2");
        let name = await page.$eval("div.product-mosaic-box > div.product-mosaic > h2", h2 => h2.textContent);
        name = name.replaceAll(' ', '_');

        // Change the file name here 
        excel_name = name+".xlsx";
        excel_name = excel_name.replace(/\n/g, '');
        excel_name = excel_name.replace(/\t/g, '');
        console.log(excel_name);

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
        m++;
    }
    await browser.close()
}

main();

// Code by Saksham Gupta
