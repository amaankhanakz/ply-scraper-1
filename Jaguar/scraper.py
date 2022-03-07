from bs4 import BeautifulSoup
import requests
import csv
import os



def get_last_page(page):

    pages = page.find('div', class_ = 'pager')

    try:
        last_page = pages.find('li', class_ = 'last-page').a['data-page']
    except Exception as e:
        try:
            last_page = page.find_all('li', class_ = 'individual-page')[-1].a['data-page']
        except IndexError:
            last_page = '1'

    return last_page

def scrape(url, use_utf_8):
    source = requests.get(url)
    page = BeautifulSoup(source.content, 'lxml')

    try:
        categories_list = page.find('div', class_ = 'categories-list')

        for li in categories_list.find_all('li'):
            print(f'https://www.jaquar.com{li.h2.a["href"]}')
            scrape(f'https://www.jaquar.com{li.h2.a["href"]}', use_utf_8)

    except Exception as e:
        print(url)
        FILTER = '#/pageSize=12&orderBy=0&pageNumber='
        first_page = '1'
        item_source = requests.get(url+FILTER+first_page)
        item_page = BeautifulSoup(item_source.content, 'lxml')
        last_page = get_last_page(page)

        dir = f'./data'
        if not os.path.exists(dir):
            os.makedirs(dir)

        file_path = f'{dir}/{url.replace("https://www.jaquar.com/en/", "")}.csv'

        if use_utf_8:
            csv_file = open(file_path, 'w', newline='', encoding="utf-8")   # symbols like ₹ wont render correctly in the final csv without using utf-8 on windows
        else:
            csv_file = open(file_path, 'w')

        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['url', 'name', 'code', 'description', 'mrp', 'image'])

        for pg in range(1, int(last_page) + 1):
            print(f'{pg}/{last_page}')
            item_source = requests.get(url+FILTER+str(pg))
            item_page = BeautifulSoup(item_source.content, 'lxml')

            try:
                item_box = page.find_all('li', class_='item-box')
            except Exception as e:
                break

            for item in item_box:
                try:
                    href = item.find('h2', class_ = 'product-title').a['href']
                except Exception as e:
                    href = ''
                    break

                item_url = f'https://www.jaquar.com{href}'
                print(item_url)

                try:
                    code = item.find('div', class_ = 'product-code sku').span.text
                except Exception as e:
                    code = ''

                try:
                    mrp = item.find('span', class_ = 'price actual-price').text
                except Exception as e:
                    mrp = ''

                try:
                    item_source = requests.get(item_url).text
                    item_page = BeautifulSoup(item_source, 'lxml')
                except Exception as e:
                    break

                try:
                    name = item_page.find('div', class_ = 'detail-header').h1.text
                except Exception as e:
                    name = ''

                try:
                    description = item_page.find('div', class_ = 'shortDdiv').find_next('span').find_next('span').text
                except Exception as e:
                    description = ''

                try:
                    img = item_page.find('img', class_ = 'container-image')['src']
                except Exception as e:
                    img = ''
                csv_writer.writerow([item_url, name, code, description, mrp, img])

        csv_file.close()


if __name__ == '__main__':

    '''
    usege:
    -> check if url is correct
    -> run
    '''

    url = 'https://www.jaquar.com/en/jaquar-products'

    if os.name == 'posix':
        use_utf_8 = False
    else:
        use_utf_8 = True

    scrape(url, use_utf_8)