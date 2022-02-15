import csv
from bs4 import BeautifulSoup
import requests


file_name="water_closet.csv"

csv_file = open(file_name, 'w', newline='', encoding="utf-8")
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['url', 'name', 'Catalogue No.', 'description', 'mrp', 'colors', 'image links','Size'])



url_pages='https://www.hindwarehomes.com/sanitaryware/water_closet/'


html_text_pages=requests.get(url_pages).text

soup_pages= BeautifulSoup(html_text_pages,'lxml')

try :
    pages_finding=soup_pages.find("ul",class_="page-numbers").find_all("a",class_="page-numbers")
    total_pages=int(pages_finding[-2].text)

except Exception as e:
    try :
        pages_finding=soup_pages.find("ul",class_="page-numbers").find_all("a",class_="page-numbers")
        total_pages=int(pages_finding[-3].text)
    except IndexError:
        total_pages=1

print(f"---->Total-pages={total_pages}\n")


for i in range (1,total_pages+1):
    print(f"---->page{i}<------")
    url_page_by_page=url_pages+f'/page/{i}/'
    html_text_page_by_page=requests.get(url_page_by_page).text

    soup_page_by_page= BeautifulSoup(html_text_page_by_page,'lxml')

    try :
        all_items_div=soup_page_by_page.find("div",class_="justify-content-center")
        all_items_product_div=all_items_div.find_all("div",class_="product")
    except Exception as e:
        print("----->No products in the page ")
        print(f"Error :{e}")
        break 

    for item in all_items_product_div:
        try:
            url_single_item=item.find("a",class_="woocommerce-LoopProduct-link woocommerce-loop-product__link")["href"]
        except Exception as e:
            print("---->Item page not found")
            break
        
        try :
            img_url_find=item.find("a",class_="woocommerce-LoopProduct-link woocommerce-loop-product__link").find("img")["src"]
            img_url_single_item=(img_url_find.replace("-430x392","")).replace("-430x430","")
        except Exception as e:
            img_url_single_item=""

        colour_names=[]
        try :
            colour_find=item.find("div",class_="wc_color_attibutes").find_all("span")
            for color_index in range (1,len(colour_find)):
                colour_names.append(colour_find[color_index]["data-title"])
        except Exception as e:
            print(f"---->Error: {e}")
        html_text_single_item=requests.get(url_single_item).text

        soup_single_item= BeautifulSoup(html_text_single_item,'lxml')

        try:
            div_details=soup_single_item.find("div",class_="summary")
        except :
            break
        try :
            product_name=div_details.find("h1",class_="product_title").text
            # print(product_name)
        except :
            product_name=""

        product_price=div_details.find("p",class_="price").find("span",class_="woocommerce-Price-amount").find("bdi").text
        # print(product_price)

        try :
            product_desc=soup_single_item.find("div",class_="woocommerce-product-details__short-description").find("p").text
            # print(product_desc)
        except :
            product_desc=""


        try :
            product_details_section=soup_single_item.find_all("div",class_="attributesSection")

            try :
                product_code=product_details_section[0].find("div",class_="value").text
            except:
                product_code=""
            try :
                for attr in product_details_section:
                    if (attr.find("h6",class_="title").text)=="Size":
                        product_size=attr.find("div",class_="value").text
            except:
                product_size=""
        except  Exception as e:
            print(f"----->Error : {e}")

        

        product_url=url_single_item
        product_colour=colour_names
        product_img=img_url_single_item
        csv_writer.writerow([product_url, product_name, product_code, product_desc, product_price, product_colour,product_img,product_size ])

        

    
