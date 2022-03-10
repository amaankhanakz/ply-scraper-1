import csv
from bs4 import BeautifulSoup
import requests


file_name="cleaners.csv"

csv_file = open(file_name, 'w', newline='', encoding="utf-8")
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['url', 'name', 'Code', 'description','Size', 'image links',])



url_pages='https://www.somanyceramics.com/bathware/cleaners.html'


# https://www.somanyceramics.com/bathware/sanitaryware/toilets.html?p=1
# https://www.somanyceramics.com/bathware/sanitaryware/toilets.html?p=2

html_text_pages=requests.get(url_pages).text

soup_pages= BeautifulSoup(html_text_pages,'lxml')

try :
    pages_finding=soup_pages.find("ul",class_="items pages-items").find_all("li",class_="item")
    total_pages=int(pages_finding[-2].find("a").find_all("span")[-1].text)

except Exception as e:
    try :
        pages_finding=soup_pages.find("ul",class_="page-numbers").find_all("a",class_="page-numbers")
        total_pages=int(pages_finding[-2].find("a").find_all("span")[-2].text)

    except :
        total_pages=1

print(f"---->Total-pages={total_pages}\n")


for i in range (1,total_pages+1):
    print(f"---->page{i}<------")
    url_page_by_page=url_pages+f'?p={i}'
    # print(url_page_by_page)
    html_text_page_by_page=requests.get(url_page_by_page).text

    soup_page_by_page= BeautifulSoup(html_text_page_by_page,'lxml') 

    try :
        all_items_div=soup_page_by_page.find("div",class_="products-grid-wrapper isotope-wrapper")
        all_items_product_div=all_items_div.find_all("div",class_="product-item")
    except Exception as e:
        print("----->No products in the page ")
        print(f"Error :{e}")
        break 

    for item in all_items_product_div:
        try:
            url_single_item=item.find("div",class_="item active").find("a")["href"]
        except Exception as e:
            print("---->Item page not found")
            break
        
        try :
            img_url_single_item=item.find("div",class_="product-item-photo").find("img",class_="product-image-photo")["src"]
        except Exception as e:
            img_url_single_item=""

        html_text_single_item=requests.get(url_single_item).text
        soup_single_item= BeautifulSoup(html_text_single_item,'lxml')

        try:
            div_details=soup_single_item.find("div",class_="product-info-block classic")
        except :
            break
        try :
            product_name=div_details.find("h1",class_="product-name").text
            # print(product_name)
        except :
            product_name=""
    
        try :
            product_desc_section=soup_single_item.find("div",class_="product-description").find_all("li")
            product_desc=""
            for desc in product_desc_section:
                product_desc+=desc.text+" "
        except :
                product_desc=""



        try :
            product_details_section=soup_single_item.find("div",class_="product attribute justify overview")
            product_size=product_details_section.find("div",class_="value").find("li").text
        except  Exception as e:
            product_size=""
            print(f"----->Error : {e}")


        try:
            product_code=soup_single_item.find_all("div",class_="product-name-wrapper")[-1].find("div",class_="row").find("h3").text
            product_code=product_code[product_code.find(":")+2:]
        except :
            product_code=""

        product_url=url_single_item
        product_img=img_url_single_item
        
        if "Size: (WxPxH) :" in product_desc:
            
            product_desc_1=soup_single_item.find("div",class_="product-description").find_all("b")
            product_size_1=soup_single_item.find("div",class_="product-description").find_all("li")
            if product_desc_1!=[] and product_size_1!=[]:
                product_size=product_desc_1[0].text+" : "+product_size_1[0].text + " , " + product_desc_1[-1].text+" : "+product_size_1[-1].text
                product_desc=""
            else :
                product_size=product_desc
                product_desc=""
            

        elif product_desc!="" and product_desc==product_size:
            product_desc=""
        elif "Size" in product_desc:
            product_size=product_desc
            product_desc=""
        elif "l size:" in product_desc.lower():
            size_start=product_desc.lower().find("size")
            product_size=product_desc[size_start:size_start+14]
        
        
        csv_writer.writerow([product_url, product_name, product_code, product_desc,product_size , product_img])

        
# if "size" in  a.lower():
#     size_start=a.lower().find("size")
#     print(a[size_start:size_start+14])
    
