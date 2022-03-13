import concurrent.futures
from bs4 import BeautifulSoup
import requests
import csv
import os


def scrape(url, use_utf_8):
    source = requests.get(url)
    page = BeautifulSoup(source.text, 'lxml')

    data_dir = './data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    subsection_links = tuple(url + links.attrs['href'] for links in page.select('#lblMenu > nav > div > ul > li > ul > div > li.col-sm-4.no-padding-left.menuleft > div > div > div > ul > li > a'))
    subsection_files = tuple('./data' + file[len(url):] + '.csv' for file in subsection_links)
    link_file_iter = tuple(zip(subsection_links, subsection_files))

    for link, file in link_file_iter:
        print(f'> {link} --> {file}')
        if use_utf_8:
            csv_file = open(file, 'w', newline='', encoding="utf-8")   # otherwise it will throw error for symbols like ₹ on windows
        else:
            csv_file = open(file, 'w')

        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['name', 'url', 'image', 'description'])

        subsection_source = requests.get(link)
        subsection_page = BeautifulSoup(subsection_source.text, 'lxml')

        p_name = (a.text for a in subsection_page.select('div.pro-box h1 a'))
        p_url = (url + '/' + a.attrs['href'] for a in subsection_page.select('div.pro-box h1 a'))

        def scrape_product(name_url_iter):
            print(name_url_iter[1])
            product_source = requests.get(name_url_iter[1])
            product_page = BeautifulSoup(product_source.text, 'lxml')

            p_name = name_url_iter[0]
            p_url = name_url_iter[1]

            try:
                p_imgs = [url + img.attrs['src'].replace(' ', '%20') for img in product_page.select('ul.list-inline > li > a > img')]
                try:
                    p_imgs.append(url + product_page.select_one('#ContentPlaceHolder1_lblInstallationDiagramImageUrl').attrs['src'].replace(' ', '%20'))
                except Exception as e:
                    pass
            except Exception as e:
                p_imgs = ''

            try:
                p_info1 = [
                    product_page.select_one('div.col-sm-6.diagram-text.text-center :nth-child(1)').text.replace('\n', '') + ': ' +
                    product_page.select_one('div.col-sm-6.diagram-text.text-center :nth-child(2)').text.replace('\n', ''),
                    product_page.select_one('div.col-sm-6.diagram-text.text-center :nth-child(3)').text.replace('\n', '') + ': ' +
                    product_page.select_one('div.col-sm-6.diagram-text.text-center :nth-child(4)').text.replace('\n', '')
                ]
            except Exception as e:
                p_info1 = []
            try:
                p_info2_zip = zip(
                    [span.text for span in product_page.select('#form1 > div:nth-child(13) > div > div > h1 > span')],
                    [span.text for span in product_page.select('#form1 > div:nth-child(13) > div > div > p > span')]
                )
                p_info2 = [i[0]+': '+i[1] for i in p_info2_zip]
            except Exception as e:
                p_info2 = []
            try:
                p_info3 = [
                    product_page.select_one('div.pro-text > div > div > h1 > span').text + ': ' +
                    product_page.select_one('div.pro-text > div > div > p > span').text
                ]
            except Exception as e:
                p_info3 = []
            p_info = p_info1 + p_info2 + p_info3

            csv_writer.writerow([p_name, p_url, p_imgs, p_info])

        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(scrape_product, zip(p_name, p_url))

        csv_file.close()


if __name__ == '__main__':
    '''
    usage:
    -> install requirements
    -> check if url is correct
    -> run
    '''

    if os.name == 'posix':
        use_utf_8 = False
    else:
        use_utf_8 = True

    scrape('https://www.elicaindia.com', use_utf_8)
