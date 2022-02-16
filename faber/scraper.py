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

    sections = [
        'https://faberindia.com/product-category/chimney-hoods/aerostation/',
        'https://faberindia.com/product-category/chimney-hoods/3d-chimneys/',
        'https://faberindia.com/product-category/chimney-hoods/auto-clean-3d/',
        'https://faberindia.com/product-category/chimney-hoods/ceiling-mounted/',
        'https://faberindia.com/product-category/chimney-hoods/collection-series/',
        'https://faberindia.com/product-category/chimney-hoods/platinum-series/',
        'https://faberindia.com/product-category/chimney-hoods/straight-line/',
        'https://faberindia.com/product-category/chimney-hoods/traditional/',
        'https://faberindia.com/product-category/gas-appliance/built-in-induction-hobs/',
        'https://faberindia.com/product-category/gas-appliance/built-in-hobs/',
        'https://faberindia.com/product-category/gas-appliance/cooking-range/',
        'https://faberindia.com/product-category/gas-appliance/hob-cooktop-hybrid/',
        'https://faberindia.com/product-category/gas-appliance/cooktop/',
        'https://faberindia.com/product-category/water-heaters/electric-storage/',
        'https://faberindia.com/product-category/water-heaters/electric-instant/',
        'https://faberindia.com/product-category/ro-water-purifiers/',
        'https://faberindia.com/product-category/cooking-appliances/built-in-ovens/',
        'https://faberindia.com/product-category/cooking-appliances/built-in-microwaves/',
        'https://faberindia.com/product-category/cooking-appliances/built-in-refrigerator/',
        'https://faberindia.com/product-category/cooking-appliances/built-in-warmer-drawer/',
        'https://faberindia.com/product-category/platinum-collection/',
        'https://faberindia.com/product-category/dishwashers/built-in-dishwasher/',
        'https://faberindia.com/product-category/dishwashers/free-standing/',
        'https://faberindia.com/product-category/dishwashers/table-top/',
        'https://faberindia.com/product-category/health-and-sanitization/hand-sanitizer-dispenser/',
        'https://faberindia.com/product-category/health-and-sanitization/oxypure-purifier/',
        'https://faberindia.com/product-category/health-and-sanitization/uv-care-box/',
        'https://faberindia.com/product-category/small-appliances/kettles/',
        'https://faberindia.com/product-category/small-appliances/mixer-grinder/',
        'https://faberindia.com/product-category/small-appliances/oven-toaster-grill/',
        'https://faberindia.com/product-category/small-appliances/toster/',
        'https://faberindia.com/product-category/small-appliances/multi-cooker/',
        'https://faberindia.com/product-category/small-appliances/yogurt-maker/',
        'https://faberindia.com/product-category/small-appliances/slow-juicer/',
        'https://faberindia.com/product-category/small-appliances/air-fryer/'
    ]

    file_names = [
        './data/chimney-hoods/aerostation.csv',
        './data/chimney-hoods/3d-chimneys.csv',
        './data/chimney-hoods/auto-clean-3d.csv',
        './data/chimney-hoods/ceiling-mounted.csv',
        './data/chimney-hoods/collection-series.csv',
        './data/chimney-hoods/platinum-series.csv',
        './data/chimney-hoods/straight-line.csv',
        './data/chimney-hoods/traditional.csv',
        './data/gas-appliance/built-in-induction-hobs.csv',
        './data/gas-appliance/built-in-hobs.csv',
        './data/gas-appliance/cooking-range.csv',
        './data/gas-appliance/hob-cooktop-hybrid.csv',
        './data/gas-appliance/cooktop.csv',
        './data/water-heaters/electric-storage.csv',
        './data/water-heaters/electric-instant.csv',
        './data/ro-water-purifiers.csv',
        './data/cooking-appliances/built-in-ovens.csv',
        './data/cooking-appliances/built-in-microwaves.csv',
        './data/cooking-appliances/built-in-refrigerator.csv',
        './data/cooking-appliances/built-in-warmer-drawer.csv',
        './data/platinum-collection.csv',
        './data/dishwashers/built-in-dishwasher.csv',
        './data/dishwashers/free-standing.csv',
        './data/dishwashers/table-top.csv',
        './data/health-and-sanitization/hand-sanitizer-dispenser.csv',
        './data/health-and-sanitization/oxypure-purifier.csv',
        './data/health-and-sanitization/uv-care-box.csv',
        './data/small-appliances/kettles.csv',
        './data/small-appliances/mixer-grinder.csv',
        './data/small-appliances/oven-toaster-grill.csv',
        './data/small-appliances/toster.csv',
        './data/small-appliances/multi-cooker.csv',
        './data/small-appliances/yogurt-maker.csv',
        './data/small-appliances/slow-juicer.csv',
        './data/small-appliances/air-fryer.csv'
    ]

    # note: subsections are just filters and there is a lot of overlap. separate manually for maximum pain🥲.

    scrape(sections, file_names)
