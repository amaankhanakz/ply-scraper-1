const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: false });
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "load",
        timeout: 0,
    });

    // all product categories
    var links = await page.$$eval('a.img-link', (a) => a.map((a) => a.href));


    // satvik
    const satvik_wb = xlsx.utils.book_new();

    await page.goto(links[0], {
        waitUntil: "load",
        timeout : 0,
    });

    satvik_data = [];

    // all names
    var satvik_product_names = await page.$$eval('div.tab-manu > ul > li > a', (a) => a.map((a) => a.innerText.trim()));

    // all ids
    var satvik_product_ids = await page.$$eval('div.tab-manu > ul > li', (li) => li.map((li) => li.getAttribute('data-tab-name')));

    for(i = 0; i < satvik_product_names.length; i++) {
        // name
        p_name = satvik_product_names[i];

        // id
        p_id = satvik_product_ids[i];

        // link
        p_link = links[0];

        // image
        p_img = await page.$eval(`div#${p_id} > div > div:nth-child(1) > div:nth-child(1) > img`, (img) => img.src);

        // description
        try {
            p_desc_h3 = await page.$eval(`#${p_id} > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(1) > h3`, (h3) => h3.innerText);
        } catch (e) {
            p_desc_h3 = '';
        }
        try {
            p_desc_p = await page.$eval(`div#${p_id} > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(2) > p`, (h3) => h3.innerText.trim().replaceAll('\n', ''));
        } catch (e) {
            p_desc_p = '';
        }
        if (p_desc_h3 === p_desc_p) {
            p_desc = '';
        } else {
            p_desc = `${p_desc_h3}: ${p_desc_p}`;
        }

        // perfect for
        try {
            p_perf = await page.$eval(`div#${p_id} > div > div:nth-child(3) > div:nth-child(2)`, (perf) => perf.innerText.split(' ').filter(x => x !== '').filter(x => x !== '\n').map((x) => x.replaceAll('\n', '')).join(' '));
        } catch (e) {
            p_perf = '';
        }

        // why choose
        try {
            p_why = await page.$eval(`#${p_id} > div > div:nth-child(5) > div:nth-child(2)`, (x) => x.innerText.split(' ').filter(x => x !== '').filter(x => x !== '\n').map((x) => x.replaceAll('\n', '')).join(' '));
        }
        catch (e){
            p_why = '';
        }

        // all data
        p_data = {
            NAME: p_name,
            ID: p_id,
            LINK: p_link,
            IMAGE: p_img,
            DESCRIPTION: p_desc,
            PERFECT_FOR: p_perf,
            WHY_CHOOSE: p_why,
        };
        // console.log(p_data);
        satvik_data.push(p_data);
    }

    const satvik_ws = xlsx.utils.json_to_sheet(satvik_data);
    xlsx.utils.book_append_sheet(satvik_wb, satvik_ws);
    xlsx.writeFile(satvik_wb, "./data/satvik.xlsx");


    // sahaj
    const sahaj_wb = xlsx.utils.book_new();

    await page.goto(links[1], {
        waitUntil: "load",
        timeout : 0,
    });

    sahaj_data = [];

    // all names
    var sahaj_product_names = await page.$$eval('div.tab-manu > ul > li > a', (a) => a.map((a) => a.innerText.trim()));

    // all ids
    var sahaj_product_ids = await page.$$eval('div.tab-manu > ul > li', (li) => li.map((li) => li.getAttribute('data-tab-name')));

    for(i = 0; i < sahaj_product_names.length; i++) {
        // name
        p_name = sahaj_product_names[i];

        // id
        p_id = sahaj_product_ids[i];

        // link
        p_link = links[1];

        // image
        p_img = await page.$eval(`div#${p_id} > div > div:nth-child(1) > div:nth-child(1) > img`, (img) => img.src);

        // why choose
        try {
            p_why = await page.$eval(`#${p_id} > div > div:nth-child(3) > div:nth-child(2)`, (x) => x.innerText.split(' ').filter(x => x !== '').filter(x => x !== '\n').map((x) => x.replaceAll('\n', '')).join(' '));
        }
        catch (e){
            try {
                p_why = await page.$eval(`div#${p_id} > div.row:nth-child(3) > div:nth-child(2)`, (x) => x.innerText.split(' ').filter(x => x !== '').filter(x => x !== '\n').map((x) => x.replaceAll('\n', '')).join(' ').replaceAll('.', '. '));
            } catch (e) {
                p_why = 'xxx';
            }
        }

        // options
        p_opt_name = await page.$$eval(`div#${p_id} > div.row:nth-last-child(1) > div > div > div:nth-child(2) > a > h3`, (h3) => h3.map((h3) => h3.innerText))
        p_opt_img = await page.$$eval(`div#${p_id} > div.row:nth-last-child(1) > div > div > div:nth-child(1) > img`, (img) => img.map((img) => img.src))
        p_opts = []
        for(i = 0; i < p_opt_name.length; i++) {
            p_opts.push(`${p_opt_name}: ${p_opt_img}`)
        }

        // all data
        p_data = {
            NAME: p_name,
            ID: p_id,
            LINK: p_link,
            IMAGE: p_img,
            WHY_CHOOSE: p_why,
            OPTIONS: p_opts,
        };
        // console.log(p_data);
        sahaj_data.push(p_data);
    }

    const sahaj_ws = xlsx.utils.json_to_sheet(sahaj_data);
    xlsx.utils.book_append_sheet(sahaj_wb, sahaj_ws);
    xlsx.writeFile(sahaj_wb, "./data/sahaj.xlsx");


    // sanyukt
    const sanyukt_wb = xlsx.utils.book_new();

    await page.goto(links[4], {
        waitUntil: "load",
        timeout : 0,
    });

    sanyukt_data = [];

    // name
    p_name = await page.$eval('section.design-desc-area.section.sanyukt > div:nth-child(1) > div > h2', (h2) => h2.innerText.trim())

    // link
    p_link = links[4]

    // image
    p_img = await page.$eval('section.design-desc-area.section.sanyukt > div:nth-child(2) > div:nth-child(1) > div > img', (img) => img.src)

    // description
    p_desc = await page.$$eval('section.design-desc-area.section.sanyukt > div:nth-child(2) > div:nth-child(2) > div', (div) => div.map((div) => div.innerText.split(' ').filter(div => div !== '').filter(div => div !== '\n').map((div) => div.replaceAll('\n', '')).join(' ')))

    // all data
    p_data = {
        NAME: p_name,
        LINK: p_link,
        IMAGE: p_img,
        DESCRIPTION: p_desc,
    };
    // console.log(p_data);
    sanyukt_data.push(p_data);

    const sanyukt_ws = xlsx.utils.json_to_sheet(sanyukt_data);
    xlsx.utils.book_append_sheet(sanyukt_wb, sanyukt_ws);
    xlsx.writeFile(sanyukt_wb, "./data/sanyukt.xlsx");



    // shresht
    const shresht_wb = xlsx.utils.book_new()

    await page.goto(links[2], {
        waitUntil: "load",
        timeout : 0,
    });

    shresht_data = [];

    // scrolling till bottom
    const checkAllEqual = arr => arr.every(v => v === arr[0]);

    let allPrevItems;
    let allCurrentItems;
    let tolerance = 0;
    let tolerance_arr = [0, 1, 2];

    allPrevItems = await page.$$eval('div.img-holder > img', (img) => img.map((img) => img.src));
    while(true) {
        await page.hover('body > section.brand-area.subscribe-area > div > div > div.col-sm-6.col-md-6.text-right');

        allCurrentItems = await page.$$eval('div.img-holder > img', (img) => img.map((img) => img.src));

        if (allPrevItems[allPrevItems.length - 1] === allCurrentItems[allCurrentItems.length - 1]) {
            tolerance_arr[tolerance % 3] = allCurrentItems[allCurrentItems.length - 1];
            ++tolerance;
            if (checkAllEqual(tolerance_arr)) { break; }
            await page.waitForTimeout(3000);
        }
        allPrevItems = allCurrentItems;
    }

    // link
    p_link = links[2];

    // details
    p_details = await page.$$eval('div.text-holder', div => div.map(div => div.textContent.split('\n').map(el => el.trim()).filter(el => el != '')));
    p_details = p_details.splice(4);
    p_details.splice(p_details.length - 4);

    // image
    p_img = await page.$$eval('div.img-holder > img', img => img.map(im => im.src));
    p_img = p_img.splice(4);

    // why choose
    p_why = await page.$$eval('ul.why-choose-list > li', li => li.map(el => el.textContent.split('\n').map(el => el.trim()).filter(el => el != '').join(', ')));

    // json data
    for (i = 0; i < p_img.length; i++) {
        p_data = {
            NAME: p_details[i][2],
            CODE: p_details[i][1],
            SERIES: p_details[i][0],
            LINK: p_link,
            IMAGE: p_img[i],
            WHY_CHOOSE: p_why,
        };
        // console.log(p_data);
        shresht_data.push(p_data);
    }
    const shresht_ws = xlsx.utils.json_to_sheet(shresht_data);
    xlsx.utils.book_append_sheet(shresht_wb, shresht_ws);
    xlsx.writeFile(shresht_wb, "./data/shresht.xlsx");



    // shikhar
    const shikhar_wb = xlsx.utils.book_new();

    await page.goto(links[3], {
        waitUntil: "load",
        timeout : 0,
    });

    shikhar_data = [];

    // sub sections
    shikhar_subsections = await page.$$eval('ul.tab-manu-items.flex-tabs.text-center > li', li => li.map(el => el.textContent.split('\n').map(el => el.trim()).filter(el => el != '').join(', ')));
    for(i = 1; i <= shikhar_subsections.length; i++) {
        // clicking subsections
        await page.hover(`ul.tab-manu-items.flex-tabs.text-center > li:nth-child(${i}) > a`);
        await page.waitForTimeout(3000);
        await page.click(`ul.tab-manu-items.flex-tabs.text-center > li:nth-child(${i}) > a`);
        await page.waitForTimeout(3000);

        num_opts = [3, 6, 2, 2, 0]      // hard coded cos other way is mind numbing

        // scrolling till bottom
        const checkAllEqual1 = arr => arr.every(v => v === arr[0]);

        let allPrevItems;
        let allCurrentItems;
        let tolerance = 0;
        let tolerance_arr = [0, 1, 2];

        allPrevItems = await page.$$eval('div.img-holder > img', (img) => img.map((img) => img.src));
        while(true) {
            await page.hover('body > section.footer-bottom-area > div > div > div > div');

            allCurrentItems = await page.$$eval('div.img-holder > img', (img) => img.map((img) => img.src));

            if (allPrevItems[allPrevItems.length - 1] === allCurrentItems[allCurrentItems.length - 1]) {
                tolerance_arr[tolerance % 3] = allCurrentItems[allCurrentItems.length - 1];
                ++tolerance;
                if (checkAllEqual1(tolerance_arr)) { break; }
                await page.waitForTimeout(3000);
            }
            allPrevItems = allCurrentItems;
        }

        // link
        p_link = links[3];

        // details
        p_details = await page.$$eval('div.text-holder', div => div.map(div => div.textContent.split('\n').map(el => el.trim()).filter(el => el != '')));
        p_details = p_details.splice(num_opts[i-1]);
        p_details.splice(p_details.length - 4);

        // image
        p_img = await page.$$eval('div.img-holder > img', img => img.map(im => im.src));
        p_img = p_img.splice(num_opts[i-1]);

        // why choose
        p_why = await page.$$eval('ul.why-choose-list > li', li => li.map(el => el.textContent.split('\n').map(el => el.trim()).filter(el => el != '').join(', ')));

        // json data
        for (j = 0; j < p_img.length; j++) {
            p_data = {
                NAME: p_details[j][2],
                CODE: p_details[j][1],
                SERIES: p_details[j][0],
                LINK: p_link,
                IMAGE: p_img[j],
                WHY_CHOOSE: p_why,
            };
            // console.log(p_data);
            shikhar_data.push(p_data);
        }
    }
    const shikhar_ws = xlsx.utils.json_to_sheet(shikhar_data);
    xlsx.utils.book_append_sheet(shikhar_wb, shikhar_ws);
    xlsx.writeFile(shikhar_wb, "./data/shikhar.xlsx");

    await browser.close();
}

async function main() {
    scrape('https://www.asianprelam.com/');
}

main();