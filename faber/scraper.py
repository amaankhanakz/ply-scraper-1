from math import prod
from select import select
from bs4 import BeautifulSoup
import requests
import csv

def get_last_page(page):
    try:
        page_bar = page.find_all('a', class_ = 'page-numbers')
        return page_bar[-2].text
    except Exception as e:
        return 1

def scrape(sections, file_path, is_windows):
    for section in sections:
        print(f'> {section}')
        section_source = requests.get(section).text
        section_page = BeautifulSoup(section_source, 'lxml')
        last_page = get_last_page(section_page)
        print(f'> last page - {last_page}')
        



if __name__ == '__main__':

    # *** change `IS_WINDOWS` to True if running on windows
    IS_WINDOWS = False

    FILE_PATH = 'faber/test.csv'

    sections = [
        'https://faberindia.com/product-category/chimney-hoods/',
        'https://faberindia.com/product-category/gas-appliance/',
        'https://faberindia.com/product-category/water-heaters/',
        'https://faberindia.com/product-category/ro-water-purifiers/',
        'https://faberindia.com/product-category/cooking-appliances/',
        'https://faberindia.com/product-category/platinum-collection',
        'https://faberindia.com/product-category/dishwashers/',
        'https://faberindia.com/product-category/health-and-sanitization/',
        'https://faberindia.com/product-category/small-appliances/'
    ]

    scrape(sections, FILE_PATH, IS_WINDOWS)