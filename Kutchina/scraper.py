import concurrent.futures
from bs4 import BeautifulSoup
import requests
import csv
import os


def scrape(url, use_utf_8):
    source = requests.get(url)
    page = BeautifulSoup(source.text, 'lxml')

    pages = page.select('#archive-product > div.archive-border > ul:nth-child(2)')
    print(pages)


if __name__ == '__main__':

    '''
    usage:
    -> check if url is correct
    -> run
    '''

    if os.name == 'posix':
        use_utf_8 = False
    else:
        use_utf_8 = True

    urls = [
        'https://www.kutchina.com/product-category/large-kitchen-appliances/kitchen-chimney/',
        'https://www.kutchina.com/product-category/large-kitchen-appliances/kitchen-hob-and-stove/',
        'https://www.kutchina.com/product-category/large-kitchen-appliances/dishwashers/',
        'https://www.kutchina.com/product-category/large-kitchen-appliances/built-in-oven/',
        'https://www.kutchina.com/product-category/large-kitchen-appliances/microwave-oven/',
        'https://www.kutchina.com/product-category/large-kitchen-appliances/veg-cleaner/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/electric-kettle/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/hand-blender/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/induction-cooker-chulha/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/juicer-machine-mixer/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/mixer-grinder/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/otg-oven-toaster-griller/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/sandwich-machine-maker/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/toaster/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/cooktop-gas/',
        'https://www.kutchina.com/product-category/small-kitchen-appliances/rice-cooker/',
        'https://www.kutchina.com/product-category/modular-kitchens/',
        'https://www.kutchina.com/product-category/water-purifiers/',
        'https://www.kutchina.com/product-category/combo-set/',
        'https://www.kutchina.com/product-category/frypan/',
        'https://www.kutchina.com/product-category/kadhai/',
        'https://www.kutchina.com/product-category/omni-tawa/',
        'https://www.kutchina.com/product-category/chimney-and-cooktop/',
        'https://www.kutchina.com/product-category/chimney-and-induction/',
        'https://www.kutchina.com/product-category/chimney-and-kettle/',
        'https://www.kutchina.com/product-category/chimney-and-juicer/',
        'https://www.kutchina.com/product-category/chimney-and-hand-blender/',
        'https://www.kutchina.com/product-category/induction-and-cookware/'
    ]

    for url in urls:
        scrape(url, use_utf_8)
