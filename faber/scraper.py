from bs4 import BeautifulSoup
import requests
import csv

def get_last_page(page):
    try:
        page_bar = page.find_all('a', class_ = 'page-numbers')
        return page_bar[-2].text
    except Exception as e:
        return 1

def scrape(sections, file_names):
    LAYOUT = '?layout=list'
    for i in range(len(sections)):
        with open(file_names[i], 'w') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerow(['name', 'url', 'img', 'code', 'description', 'category', 'category_link', 'additional_info'])
            section = sections[i]
            pg = 1
            print(f'> {section}')
            # section_source = requests.get(section).text
            section_source = requests.get(f'{section}page/{pg}/{LAYOUT}').text
            section_page = BeautifulSoup(section_source, 'lxml')
            last_page = get_last_page(section_page)
            print(f'> last page - {last_page}')

            for i in range(int(last_page)):
                print(f'> pg {pg}/{last_page}')

                if pg != 1:
                    section_source = requests.get(f'{section}page/{pg}/{LAYOUT}').text
                    section_page = BeautifulSoup(section_source, 'lxml')

                products_listing = section_page.find('ul', class_ = 'products-list')
                products = products_listing.find_all('li', class_ = 'product-list')
                name = ''
                url = ''
                img = ''
                code = ''
                description = []
                category = []
                category_link = []
                additional_info = []

                for item in products:
                    try:
                        img = item.find('div', class_ = 'product-image').img['src']
                    except AttributeError:
                        print('>> no img??')

                    try:
                        caption = item.find('div', class_ = 'product-caption')
                        url = caption.h3.a['href']
                        name = caption.h3.a.text
                    except AttributeError:
                        print('>> no name/url??')

                    try:
                        posted_in = caption.find('div', class_ = 'posted-in')
                        category_a = posted_in.find_all('a')
                        for a in category_a:
                            category.append(a.text)
                            category_link.append(a['href'])
                    except AttributeError:
                        print('>> no category??')

                    try:
                        short_description = caption.find('div', class_ = 'short-description')
                        short_description_p = short_description.find_all('p')
                        for p in short_description_p:
                            description.append(p.text)
                    except AttributeError:
                        print('>> no description')

                    try:
                        item_src = requests.get(url).text
                        item_page = BeautifulSoup(item_src, 'lxml')
                    except Exception as e:
                        print('>> no item page??')

                    try:
                        code = item_page.find('span', class_ = 'sku').text
                    except AttributeError:
                        print('>> no code??')

                    try:
                        table = item_page.find('table', class_ = 'woocommerce-product-attributes shop_attributes')
                        tbody = table.find_all('tr')
                        for tr in tbody:
                            additional_info.append(f'({tr.th.text} - {tr.td.p.text})')
                    except AttributeError:
                        pass

                    # print(f'{name}, {url}, {img}, {code}, {description}, {category}, {category_link}, {additional_info}')
                    print(f'{url}  ↑')
                    csv_writer.writerow([name, url, img, code, description, category, category_link, additional_info])

                pg += 1


if __name__ == '__main__':

    FILE_PATH = './test.csv'

    sections = [
        'https://faberindia.com/product-category/chimney-hoods/',
        'https://faberindia.com/product-category/gas-appliance/',
        'https://faberindia.com/product-category/water-heaters/',
        'https://faberindia.com/product-category/ro-water-purifiers/',
        'https://faberindia.com/product-category/cooking-appliances/',
        'https://faberindia.com/product-category/platinum-collection/',
        'https://faberindia.com/product-category/dishwashers/',
        'https://faberindia.com/product-category/health-and-sanitization/',
        'https://faberindia.com/product-category/small-appliances/'
    ]

    file_names = [
        './chimney-hoods.csv',
        './gas-appliance.csv',
        './water-heaters.csv',
        './ro-water-purifiers.csv',
        './cooking-appliances.csv',
        './platinum-collection.csv',
        './dishwashers.csv',
        './health-and-sanitization.csv',
        './small-appliances.csv'
    ]

    scrape(sections, file_names)
