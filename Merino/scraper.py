from bs4 import BeautifulSoup
import requests
import csv


def scrape(sections, file_names):
    for i in range(len(sections)):
        with open(file_names[i], 'w') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerow(['name', 'code', 'url', 'image', 'details'])

            print(f'> {sections[i]}')
            section_source = requests.get(sections[i])
            section_page = BeautifulSoup(section_source.content, 'lxml')

            if sections[i] == 'https://www.merinolaminates.com/en/product_category/merino-doors/':
                listing = section_page.find('div', class_ = 'TypeOfDoors')
                doors = listing.find_all('li')
                for i in doors:
                    name = i.h4.text
                    img = i.div.img['src']
                    code = ''
                    url = ''
                    details = []
                    print(name)
                    csv_writer.writerow([name, code, url, img, details])

            elif sections[i] == 'https://www.merinorestrooms.com/products/internal-wall-cladding-shaurya/':
                finishes = section_page.find_all('dl', class_ = 'gallery-item')
                for i in finishes:
                    img = i.dt.a['href']
                    name = 'shaurya'
                    details = 'The primary purpose of Shaurya is to provide protection to the internal wall from di­fferent damages viz. water, scratch, graffiti, soiling, impact, colour fading and minor burn marks. Apart from the damage protection, purpose, there are other reasons for installing Shaurya.'
                    code = ''
                    url = ''
                    print(name)
                    csv_writer.writerow([name, code, url, img, details])

            else:
                try:
                    product_conatiner_row = section_page.find('div', class_ = 'ProductConatinerRow')
                    product_row = product_conatiner_row.find('div', class_ = 'row')
                    for product in product_row:
                        details = []
                        try:
                            url = product.a['href']
                            img = product.img['src']
                            code = product.h4.text
                            name = product.h6.text

                            product_source = requests.get(url)
                            product_page = BeautifulSoup(product_source.content, 'lxml')

                            product_category_table = product_page.find('div', class_ = 'ProductCategoryTable')
                            table = product_category_table.find('div', class_ = 'TableTab')
                            all_tr = table.table.tbody.find_all('tr')
                            for tr in all_tr:
                                th_txt = tr.th.text
                                td_txt = tr.td.text
                                th = th_txt.replace('\n', '')
                                td = td_txt.replace('\n', '')
                                details.append(f"{th} : {td}")
                            print(name)
                            csv_writer.writerow([name, code, url, img, details])
                        except AttributeError:
                            continue
                except Exception as e:
                    print(e)


if __name__ == '__main__':

    '''
    usage:
    -> install requirements
    -> verify:
        - all site sections are listed in `sections`
        - all sites have a corresponding csv file `file_names`
        - all paths to the csv file are correct
    -> run
    '''

    sections = [
        'https://www.merinolaminates.com/en/product_category/merinolam/',
        'https://www.merinolaminates.com/en/product_category/merinolam-postforming/',
        'https://www.merinolaminates.com/en/product_category/infusio/',
        'https://www.merinolaminates.com/en/product_category/laminature/',
        'https://www.merinolaminates.com/en/product_category/finguard/',
        'https://www.merinolaminates.com/en/product_category/metalam/',
        'https://www.merinolaminates.com/en/product_category/tuff-gloss-mr/',
        'https://www.merinolaminates.com/en/product_category/unicolour/',
        'https://www.merinolaminates.com/en/product_category/writeons/',
        'https://www.merinolaminates.com/en/product_category/imagino-digital-laminates/',
        'https://www.merinolaminates.com/en/product_category/chemical-resistant-lab-grade/',
        'https://www.merinolaminates.com/en/product_category/electro-static-dissipative/',
        'https://www.merinolaminates.com/en/product_category/fire-retardant/',
        'https://www.merinolaminates.com/en/product_category/armour-film/',
        'https://www.merinolaminates.com/en/product_category/armour-superclad/',
        'https://www.merinorestrooms.com/products/internal-wall-cladding-shaurya/',
        'https://www.merinolaminates.com/en/product_category/standard-compact/',
        'https://www.merinolaminates.com/en/product_category/gloss-meister/',
        'https://www.merinolaminates.com/en/product_category/matt-meister/',
        'https://www.merinolaminates.com/en/product_category/ply-meister-gloss-and-matt/',
        'https://www.merinolaminates.com/en/product_category/merinova/',
        'https://www.merinolaminates.com/en/product_category/post-laminated-panels/',
        'https://www.merinolaminates.com/en/product_category/ecoclick/',
        'https://www.merinolaminates.com/en/product_category/prime-tile/',
        'https://www.merinolaminates.com/en/product_category/loom/',
        'https://www.merinolaminates.com/en/product_category/ecolay/',
        'https://www.merinolaminates.com/en/product_category/merino-hanex/',
        'https://www.merinolaminates.com/en/product_category/merino-blockboard/',
        'https://www.merinolaminates.com/en/product_category/merino-doors/',
        'https://www.merinolaminates.com/en/product_category/merino-plywood/',
        'https://www.merinolaminates.com/en/product_category/zeroprint/',
        'https://www.merinolaminates.com/en/product_category/onetone/',
        'https://www.merinolaminates.com/en/product_category/flex/',
        'https://www.merinolaminates.com/en/product_category/bloc/',
        'https://www.merinolaminates.com/en/product_category/stardust/',
        'https://www.merinolaminates.com/en/product_category/edge/'
    ]

    file_names = [
        './data/merinolam.csv',
        './data/merinolam-postforming.csv',
        './data/infusio.csv',
        './data/laminature.csv',
        './data/finguard.csv',
        './data/metalam.csv',
        './data/tuff-gloss-mr.csv',
        './data/unicolour.csv',
        './data/writeons.csv',
        './data/imagino-digital-laminates.csv',
        './data/chemical-resistant-lab-grade.csv',
        './data/electro-static-dissipative.csv',
        './data/fire-retardant.csv',
        './data/armour-film.csv',
        './data/armour-superclad.csv',
        './data/internal-wall-cladding-shaurya.csv',
        './data/standard-compact.csv',
        './data/gloss-meister.csv',
        './data/matt-meister.csv',
        './data/ply-meister-gloss-and-matt.csv',
        './data/merinova.csv',
        './data/post-laminated-panels.csv',
        './data/ecoclick.csv',
        './data/prime-tile.csv',
        './data/loom.csv',
        './data/ecolay.csv',
        './data/merino-hanex.csv',
        './data/merino-blockboard.csv',
        './data/merino-doors.csv',
        './data/merino-plywood.csv',
        './data/zeroprint.csv',
        './data/onetone.csv',
        './data/flex.csv',
        './data/bloc.csv',
        './data/stardust.csv',
        './data/edge.csv'
    ]

    scrape(sections, file_names)