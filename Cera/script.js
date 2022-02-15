const puppeteer = require("puppeteer");
const xlsx = require("xlsx");

(async () => {
  const browser = await puppeteer.launch({ headless: true });

  async function getPageData(url) {
    let page = await browser.newPage();
    await page.goto(url, {
      waitUntil:"load",
      timeout:0,
    });
    const prod = await page.$$eval("div.long-description > *", (prods) => {
      const filtered = prods.filter((p) => p.textContent);
      return filtered.map((p) => p.textContent);
    });
    // const pName = prod[0];
    const pDesc = prod[1];
    // const pNewCat = prod[2];
    // const pOldCat = prod[4];
    const sku = prod[prod.length - 1];

    // Heading
    const Product_Name = await page.$eval(
      ".title h1",
      (Product_Name) => Product_Name.textContent
    );

    // Image
    const Product_Image = await page.$eval(
      "#Zoomer > img",
      (Product_Image) => Product_Image.src
    );

    // Price
    const Product_Price = await page.$eval(
      ".price .amount",
      (Product_Price) => Product_Price.textContent
    );

    // Color
    const color = await page.$$eval("#pa_color option", (prods) => {
      return prods
        .slice(1)
        .map((p) => p.textContent)
        .join(",");
    });

    // logging final data
    const data = {
      Product_Name,
      url,
      // pName,
      pDesc,
      Product_Price,
      // pNewCat,
      // pOldCat,
      sku,
      Product_Image,
      color,
    };
    // console.log("data", data);
    // page.close()
    return {
      Product_Name,
      url,
      // pName,
      pDesc,
      Product_Price,
      // pNewCat,
      // pOldCat,
      sku,
      Product_Image,
      color,
    };
  }

  async function getLinks() {
    let page = await browser.newPage();

    await page.goto(
      "https://www.cera-india.com/faucets/waste-coupling-with-pop-up-for-bath-tub/cg-103/",
      {
        waitUntil: "load",
        timeout: 0,
      }
    );

    const links = await page.$$eval(
      ".main_product_list .type-product a",
      (allAs) => allAs.map((a) => a.href)
    );

    page.close();
    return links;
  }

  async function main() {
    const allLinks = await getLinks();
    // console.log(allLinks);
    const scrapedData = [];

    for (let link of allLinks) {
      const data = await getPageData(link);
      // await page.waitFor(3000);
      scrapedData.push(data);
    }

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(scrapedData);
    xlsx.utils.book_append_sheet(wb, ws);
    xlsx.writeFile(wb, "waste-coupling-with-pop-up-for-bath-tub.xlsx");
    console.log(scrapedData);
    await browser.close();
    console.log("Done");
  }

  main();
})();
