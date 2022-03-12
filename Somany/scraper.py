import concurrent.futures
from bs4 import BeautifulSoup
import requests
import csv
import os


def get_last_page(page):
    try:
        last_page = page.select_one('ul.items.pages-items li:nth-last-child(2) a span:nth-child(2)').text
    except Exception as e:
        last_page = 1
    return int(last_page)

def scrape(url, use_utf_8):
    source = requests.get(url)
    page = BeautifulSoup(source.text, 'lxml')

    last_page = get_last_page(page)

    dir = './data'
    if not os.path.exists(dir):
        os.makedirs(dir)

    file_path = f'{dir}/tiles.csv'

    if use_utf_8:
        csv_file = open(file_path, 'w', newline='', encoding="utf-8")   # otherwise it will throw error for symbols like ₹ on windows
    else:
        csv_file = open(file_path, 'w')

    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['url', 'name', 'code', 'image', 'description'])

    for pg in range(1, last_page+1):
        print(f'{pg}/{last_page}')
        product_source = requests.get(f'{url}?p={pg}')
        product_page = BeautifulSoup(product_source.text, 'lxml')

        product_links = [product.attrs['href'] for product in product_page.select('#maincontent > div.container.paddingtop50 > div > div.col-md-9.aside > div.niks-ajax-wrapper > div.products-grid-wrapper.isotope-wrapper > ol > div > div > div > div.product-item-photo > div.carousel-inside.slide > div > div > a')]

        product_imgs = [img.attrs['src'] for img in product_page.select('#maincontent > div.container.paddingtop50 > div > div.col-md-9.aside > div.niks-ajax-wrapper > div.products-grid-wrapper.isotope-wrapper > ol > div > div > div > div.product-item-photo > div.carousel-inside.slide > div > div > a > img')]

        def scrape_product(link_img_iter):
            print(f'> {link_img_iter[0]}')
            item_source = requests.get(link_img_iter[0])
            item_page = BeautifulSoup(item_source.text, 'lxml')

            p_url = link_img_iter[0]
            p_name = item_page.select_one('#maincontent > div.block.product-block > div > div.row > div.col-sm-6.col-md-6.col-lg-8 > div > div:nth-child(1) > h1').text
            p_code = item_page.select_one('#maincontent > div.block.product-block > div > div.row > div.col-sm-6.col-md-6.col-lg-8 > div > div:nth-child(2) > div > div.col-lg-4 > h3').text
            p_img = link_img_iter[1]
            p_attrs = item_page.select('div#product-attribute-specs-table div.col-md-12 div.col-md-12 strong')
            p_specs = item_page.select('div#product-attribute-specs-table div.col-md-12 div.col-md-12 span')
            p_details = tuple(zip([attr.text for attr in p_attrs], [spec.text for spec in p_specs]))

            csv_writer.writerow([p_url, p_name, p_code, p_img, p_details])

        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(scrape_product, tuple(zip(product_links, product_imgs)))

    csv_file.close()


if __name__ == '__main__':

    '''
    usage:
    -> check if url is correct
    -> run
    '''

    url = 'https://www.somanyceramics.com/tiles.html'

    if os.name == 'posix':
        use_utf_8 = False
    else:
        use_utf_8 = True

    scrape(url, use_utf_8)
