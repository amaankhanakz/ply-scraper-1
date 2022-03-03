from bs4 import BeautifulSoup
import requests
import csv


def get_last_page(page):

    pages = page.find('div', class_ = 'pager')

    try:
        last_page = pages.find('li', class_ = 'last-page').a['data-page']
        print(f'> last pg - {last_page}')
    except Exception as e:
        try:
            last_page = page.find_all('li', class_ = 'individual-page')[-1].a['data-page']
            print(f'> last pg - {last_page}')
        except IndexError:
            last_page = 1
            print(f'> last pg - {last_page}')

    return last_page

def scrape(site, path, file_path, is_windows):

    FILE_PATH = file_path

    if is_windows:
        csv_file = open(FILE_PATH, 'w', newline='', encoding="utf-8")   # symbols like ₹ wont render correctly in the final csv without using utf-8 on windows
    else:
        csv_file = open(FILE_PATH, 'w')

    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['url', 'name', 'code', 'description', 'mrp', 'colors', 'image links'])

    # to make sure page layout is alwasy consistent
    FILTER = '#/pageSize=12&orderBy=0&pageNumber='

    temp_source = requests.get(f'{site}{path}').text
    temp_page = BeautifulSoup(temp_source, 'lxml')
    last_page = get_last_page(temp_page)

    for pg in range(1, int(last_page) + 1):
        print(f'> {pg}')

        source = requests.get(f'{site}{path}{FILTER}{pg}').text
        page = BeautifulSoup(source, 'lxml')

        try:
            item_box = page.find_all('li', class_='item-box')
        except Exception as e:
            print('>>> no item box???')
            print(e)
            break

        for item in item_box:
            try:
                href = item.find('h2', class_ = 'product-title').a['href']
            except Exception as e:
                print('>>> item page not available')
                break

            url = f'{site}{href}'

            try:
                code = item.find('div', class_ = 'product-code sku').span.text
            except Exception as e:
                print('>>> code unavailable')
                code = ''

            try:
                mrp = item.find('span', class_ = 'price actual-price').text
            except Exception as e:
                print('>>> mrp unavailable')
                mrp = ''

            try:
                item_source = requests.get(url).text
                item_page = BeautifulSoup(item_source, 'lxml')
            except Exception as e:
                print('>>> product page unavailable')
                # write to csv(?)
                break

            try:
                name = item_page.find('div', class_ = 'detail-header').h1.text
                print(f'> {name}')
            except Exception as e:
                print('> how tf is the name not available??')
                name = ''

            try:
                description = item_page.find('div', class_ = 'shortDdiv').find_next('span').find_next('span').text
            except Exception as e:
                print('> description unavailable')
                description = ''

            colors = []
            img_links = []
            try:
                colors_div = item_page.find('div', class_ = 'colors')
                color_list = colors_div.find_all('li')
            except Exception as e:
                print('> no colours(?)')
                color_list = []
                try:
                    img = item_page.find('img', title = f'Show details for {name}')['src']
                except Exception as e_:
                    try:
                        img = item_page.find('img', alt = f'Picture of {name}')['src']
                    except Exception as e__:
                        print('-_-')
                        img = item_page.find('img', class_ = 'container-image')['src']
                img_links.append(img)
            
            for i in color_list:
                c = i.find('input', type = "radio")['title']
                try:
                    try:
                        img = item_page.find('img', alt = f'Picture of {name} - {c}')['src']
                    except Exception as e:
                        img = item_page.find('img', title = f'Picture of {name} - {c}')['src']
                except Exception as e:
                    try:
                        print('> no colour image(?)')
                        img = item_page.find('img', alt = f'Picture of {name}')['src']
                    except Exception as e_:
                        try:
                            img = item_page.find('img', alt = f'Picture of {name}')['src']
                        except Exception as e__:
                            print('> -_-')
                            img = item_page.find('img', class_ = 'container-image')['src']

                colors.append(c)
                img_links.append(img)

            ## uncomment next line if scraping title from listing page and not from product page
            # name = item.find('h2', class_ = 'product-title').a.text

            csv_writer.writerow([url, name, code, description, mrp, colors, img_links])

    csv_file.close()


if __name__ == '__main__':
    '''
    usage:
    -> install all requirements
    -> set `IS_WINDOWS` to True if running on windows. this will make sure to use utf-8 encoding while working with csv files. without it, symbols will liik weird in the final csv.
    -> leave `SITE` as 'https://www.jaquar.com' without a trailing '/'.
    -> set `PATH` according to the section that is to be scraped.
    -> set `FILE_PATH` as the path of the csv to which the scraped data is to be written.
    -> run

    WARNING: 300x300 resolution images are being scraped. for better resolution change 300x300 to 960x960 in the iamge link. (check if the 960x960 links work. if not check the site for correct size.)
    '''
    IS_WINDOWS = False

    SITE = 'https://www.jaquar.com'
    PATH = '/en/corner'
    FILE_PATH = 'test.csv'

    scrape(SITE, PATH, FILE_PATH, IS_WINDOWS)
