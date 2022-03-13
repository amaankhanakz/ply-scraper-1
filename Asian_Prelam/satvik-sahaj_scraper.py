from bs4 import BeautifulSoup
import requests
import csv
import os

def scrape(url, use_utf_8):
    data_dir = './data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    # satvik
    satvik_source = requests.get(url[0])
    satvik_page = BeautifulSoup(satvik_source.text, 'lxml')

    satvik_file = f'{data_dir}/satvik.csv'
    if use_utf_8:
        csv_file = open(satvik_file, 'w', newline='', encoding="utf-8")   # otherwise it will throw error for symbols like ₹ on windows
    else:
        csv_file = open(satvik_file, 'w')

    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['name', 'id', 'url', 'image', 'description', 'perfect for', 'why choose'])

    # name & id
    satvik_product_names = [a.text.strip() for a in satvik_page.select('div.tab-manu > ul > li > a')]
    satvik_product_ids = [li.attrs['data-tab-name'] for li in satvik_page.select('div.tab-manu > ul > li')]
    satvik_product_name_id_iter = zip(satvik_product_names, satvik_product_ids)

    for name, id in satvik_product_name_id_iter:
        print(f'> {name}')

        # name
        p_name = name

        # id
        p_id = id

        # url
        p_url = url[0]

        # image
        try:
            p_img = 'https://www.asianprelam.com/' + satvik_page.select_one(f'div#{id} > div > div:nth-child(1) > div:nth-child(1) > img').attrs['src']
        except Exception as e:
            p_img = ''

        # description
        try:
            p_disc_h3 = satvik_page.select_one(f'div#{id} > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(1) > h3').text
        except Exception as e:
            p_disc_h3 = ''

        try:
            p_disc_p = satvik_page.select_one(f'div#{id} > div > div:nth-child(1) > div:nth-child(2) > div > div:nth-child(2) > p').text
        except Exception as e:
            p_disc_p = ''

        if p_disc_h3 == '' and p_disc_p == '':
            p_disc = ''
        else:
            p_disc = f'{p_disc_h3}: {p_disc_p}'

        # perfect for
        try:
            p_perf = satvik_page.select_one(f'div#{id} > div > div:nth-child(3) > div:nth-child(2)').text.strip().replace('\n', '')
        except Exception as e:
            p_perf = ''

        # why choose
        try:
            p_why = ' '.join(satvik_page.select_one(f'div#{id} > div > div:nth-child(5) > div:nth-child(2)').text.split())
        except Exception as e:
            p_why = ''

        csv_writer.writerow([p_name, p_id, p_url, p_img, p_disc, p_perf, p_why])
    csv_file.close()


    # sahaj
    sahaj_source = requests.get(url[1])
    sahaj_page = BeautifulSoup(sahaj_source.text, 'lxml')

    sahaj_file = f'{data_dir}/sahaj.csv'
    if use_utf_8:
        csv_file = open(sahaj_file, 'w', newline='', encoding="utf-8")   # otherwise it will throw error for symbols like ₹ on windows
    else:
        csv_file = open(sahaj_file, 'w')

    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['name', 'id', 'url', 'image', 'why choose', 'options'])

    # name & id
    sahaj_product_names = [a.text.strip() for a in sahaj_page.select('div.tab-manu > ul > li > a')]
    sahaj_product_ids = [li.attrs['data-tab-name'] for li in sahaj_page.select('div.tab-manu > ul > li')]
    sahaj_product_name_id_iter = zip(sahaj_product_names, sahaj_product_ids)

    for name, id in sahaj_product_name_id_iter:
        print(f'> {name}')

        # name
        p_name = name

        # id
        p_id = id

        # url
        p_url = url[1]

        # image
        try:
            p_img = 'https://www.asianprelam.com/' + sahaj_page.select_one(f'div#{id} > div > div:nth-child(1) > div:nth-child(1) > img').attrs['src']
        except Exception as e:
            p_img = ''

        # why choose
        try:
            p_why = ' '.join(sahaj_page.select_one(f'div#{id} > div > div:nth-child(3) > div:nth-child(2)').text.split())
        except Exception as e:
            try:
                p_why = [li.text.replace('\n', '').replace('.', '. ') for li in sahaj_page.select_one(f'div#{id} > div.row:nth-child(3) > div:nth-child(2)')][1]
            except Exception as e1:
                p_why = ''

        # option
        try:
            p_opts_name = [h3.text for h3 in sahaj_page.select(f'div#{id} > div.row:nth-last-child(1) > div > div > div:nth-child(2) > a > h3')]
            p_opts_img = ['https://www.asianprelam.com/' + img.attrs['src'] for img in sahaj_page.select(f'div#{id} > div.row:nth-last-child(1) > div > div > div:nth-child(1) > img')]
            p_opts = [f'{opt_name}: {opt_img}' for opt_name, opt_img in zip(p_opts_name, p_opts_img)]
        except Exception as e:
            p_opts = ''

        csv_writer.writerow([p_name, p_id, p_url, p_img, p_why, p_opts])
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

    url = [
        'https://www.asianprelam.com/satvik.php',
        'https://www.asianprelam.com/sahaj.php'
    ]

    scrape(url, use_utf_8)
