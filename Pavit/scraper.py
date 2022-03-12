import concurrent.futures
from itertools import product
from unicodedata import category
from bs4 import BeautifulSoup
import requests
import csv
import os
# import time


def get_categories(url):
    source = requests.get(url)
    page = BeautifulSoup(source.content, 'lxml')

    categories = []
    category = page.find_all('li', class_ = "mega-menu-item-object-product_cat")
    for c in category:
        categories.append(c.a["href"])
    return categories

def scrape(url):
    source = requests.get(url)
    page = BeautifulSoup(source.content, 'lxml')
    last_page = get_pages(page)
    for pg in range(1, 2):
    # for pg in range(1, last_page+1):
        product_source = requests.get(f'{url}page/{pg}/')
        product_page = BeautifulSoup(product_source.content, 'lxml')
        
        product_list = product_page.find('ul', class_ = 'products')
        products = product_list.find_all('a')
        for product in products:
            print(product["href"])


def get_pages(page):
    try:
        pagination = page.find_all('a', class_ = 'page-numbers')
        last_page = pagination[-2].text
        return int(last_page)
    except Exception as e:
        return 1

if __name__ == '__main__':

    '''
    usage:
    -> check if url is correct
    -> run
    '''
    # start = time.perf_counter()

    url = 'https://www.pavits.com/'

    if os.name == 'posix':
        use_utf_8 = False
    else:
        use_utf_8 = True

    # categories = get_categories(url)
    categories = ['https://www.pavits.com/product-category/wall-tiles/']
    ## with concurrent.futures.ThreadPoolExecutor() as executor:
    ##     executor.map(scrape, categories)

    for category in categories:
        scrape(category)

    # finish = time.perf_counter()
    # print(f'>> {finish-start}')
 