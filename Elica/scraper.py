from bs4 import BeautifulSoup
import requests
import csv


def scrape(sections, file_names):
    for i in range(len(sections)):
        with open(file_names[i], 'w') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerow(['name', 'url', 'images', 'details', 'additional_features'])

            print(f'> {sections[i]}')

            section_source = requests.get(sections[i]).text
            section_page = BeautifulSoup(section_source, 'lxml')

            pro_box = section_page.find_all('div', class_ = 'pro-box')
            images = []
            details = []
            additional_features = []
            for item in pro_box:
                try:
                    name = item.h1.a.text
                    rel_url = item.h1.a['href']
                    url = f'https://www.elicaindia.com/{rel_url}'
                except AttributeError:
                    continue

                print(url)
                item_src = requests.get(url).text
                item_page = BeautifulSoup(item_src, 'lxml')

                item_slider = item_page.find('div', class_ = 'product-slider animated fadeInUp')
                item_slider_imgs = item_slider.find_all('img', class_ = 'img-responsive')
                # item_slider_imgs = item_slider_list.find_all('li')
                for img in item_slider_imgs:
                    images.append(f'https://www.elicaindia.com{img["src"]}')

                funcs = item_page.find('span', id = 'ContentPlaceHolder1_lblProductVersionHeadingDesc').text

                item_details_box = item_page.find('div', class_ = 'pro-size text-center')
                item_details = item_details_box.find_all('div')
                for k in item_details:
                    details.append(f'{k.h1.span.text} : {k.p.span.text}')

                try:
                    feat_disc = item_page.find('span', id = "ContentPlaceHolder1_lblProductFeatureDescription")
                    tbody = feat_disc.find('table')
                    rows = tbody.find_all('tr')
                    for tr in rows:
                        data = tr.find_all('td')
                        additional_features.append(f'{data[0].text} : {data[1].text}')
                except AttributeError:
                    pass

                csv_writer.writerow([name, url, images, details, additional_features])



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
        'https://www.elicaindia.com/Chimneys',
        'https://www.elicaindia.com/Built_In_Induction_Hobs',
        'https://www.elicaindia.com/Built-In_Combo_Oven',
        'https://www.elicaindia.com/Built-In_Hobs',
        'https://www.elicaindia.com/Built-In_Ovens',
        'https://www.elicaindia.com/Built-In_Microwave_Ovens',
        'https://www.elicaindia.com/Barbeques',
        'https://www.elicaindia.com/Dishwashers',
        'https://www.elicaindia.com/Fryers',
        'https://www.elicaindia.com/Warmer_Drawer',
        'https://www.elicaindia.com/WineCooler',
        'https://www.elicaindia.com/Cooktops',
        'https://www.elicaindia.com/Cooking_Ranges'
    ]

    file_names = [
        './data/Chimneys.csv',
        './data/Built_In_Induction_Hobs.csv',
        './data/Built-In_Combo_Oven.csv',
        './data/Built-In_Hobs.csv',
        './data/Built-In_Ovens.csv',
        './data/Built-In_Microwave_Ovens.csv',
        './data/Barbeques.csv',
        './data/Dishwashers.csv',
        './data/Fryers.csv',
        './data/Warmer_Drawer.csv',
        './data/WineCooler.csv',
        './data/Cooktops.csv',
        './data/Cooking_Ranges.csv'
    ]

    scrape(sections, file_names)