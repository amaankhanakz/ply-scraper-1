from bs4 import BeautifulSoup
import requests
import os


def scrape(url, dir):
    source = requests.get(url)
    page = BeautifulSoup(source.content, 'lxml')

    try:
        items = [i.attrs['href'] for i in page.select('div.temp32-item > a')]

        # scraping product
        if items == []:
            print(url)
            p_source = requests.get(url)
            p_page = BeautifulSoup(p_source.content, 'lxml')

            file_path = f'{dir}/{url.split("/")[-2]}.csv'

            if not os.path.exists(file_path):

                with open(file_path, 'w') as csv_file:
                    csv_file.write('name,link,image,description,details\n')

            with open(file_path, 'a') as csv_file:
                # name
                try:
                    p_name = p_page.select_one('h1.h3').text
                except Exception as e:
                    p_name = ''

                # link
                p_link = url
                
                # image
                try:
                    p_img = p_page.select_one('div.temp79-sliderThumbItemImg > img').attrs['src']
                except Exception as e:
                    p_img = ''

                # description
                try:
                    p_desc = p_page.select_one('div.temp51-txtPara').text
                except:
                    p_desc = ''

                # details
                try:
                    p_details = tuple(zip((span.text for span in p_page.select('div.temp50-twoColItem > span:nth-child(1)')), (span.text for span in p_page.select('div.temp50-twoColItem > span:nth-child(2)'))))
                except Exception as e:
                    p_details = ''
                
                csv_file.write(f'"{p_name}","{p_link}","{p_img}","{p_desc}","{p_details}"\n')

        # scraping product lists
        for item in items:
            scrape(item, dir)

    except Exception as e:
        print(e)



if __name__ == '__main__':

    '''
    usage:
    -> check if url is correct
    -> run
    '''

    url = 'https://www.godrej.com/godrej-locks-and-security-solutions/Locks'
    # url = 'https://www.godrej.com/godrej-locks-and-security-solutions/Shutter-and-Grill-Door-Locks'
    # url = 'https://www.godrej.com/p/godrej-locks-and-security-solutions/Baggage-Lock/Freedom-baggage-lock'

    dir = './data'
    if not os.path.exists(dir):
        os.makedirs(dir)

    scrape(url, dir)
