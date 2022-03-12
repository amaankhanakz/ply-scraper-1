import csv
from bs4 import BeautifulSoup
import requests


file_name="floor-tiles.csv"

csv_file = open(file_name, 'w', newline='', encoding="utf-8")
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['url', 'name', 'Brand Name', 'Category', 'Application_details',"Size ","Thickness","Surface",'Variation', 'Slip resistance', "packing Details","Usp",
'wt per box','Application Area(indoor/outdoor/commercial)','image links'])

# class="page last"

# url_pages='https://www.pavits.com/product-category/floor-tiles/'
url_pages= 'https://www.pavits.com/application/dining-tiles/'


html_text_pages=requests.get(url_pages).text

soup_pages= BeautifulSoup(html_text_pages,'lxml')

try :
    pages_finding=soup_pages.find("ul",class_="page-numbers").find_all("li")
    total_pages=int(pages_finding[-2].find("a",class_="page-numbers").text)

except Exception as e:
    try :
        pages_finding=pages_finding=soup_pages.find("ul",class_="page-numbers").find_all("li")
        total_pages=int(pages_finding[-3].find("a",class_="page-numbers").text)
    except :
        total_pages=1

print(f"---->Total-pages={total_pages}\n")

# class="product-item large  category1"
# class="products-grid-wrapper isotope-wrapper"

for i in range (1,total_pages+1):
    print(f"---->page{i}<------")
    url_page_by_page=url_pages+f'page/{i}/'
    
    html_text_page_by_page=requests.get(url_page_by_page).text

    soup_page_by_page= BeautifulSoup(html_text_page_by_page,'lxml')

    try :
        all_items_div=soup_page_by_page.find("ul",class_="products")
        all_items_product_div=all_items_div.find_all("li",class_="type-product")
    except Exception as e:
        print("----->No products in the page ")
        print(f"Error :{e}")
        print(all_items_div, all_items_product_div)
        break 


    for item in all_items_product_div:
        try:
            url_single_item=item.find("a")["href"]
        except Exception as e:
            print("---->Item page not found")
            break


        html_text_single_item=requests.get(url_single_item).text
        soup_single_item= BeautifulSoup(html_text_single_item,'lxml')


        try :
            product_name=soup_single_item.find("div",class_="prod-detail-title").find("h2").text.replace("  ","").replace("\n","")
        except:
            print("no")
            product_name=""

        try :
            images=[]
            div_images=soup_single_item.find("div",class_="slider-inner").find("div",class_="carousel-inner").find_all("div",class_="item")
            try :
                for each_image in div_images:
                    img_link=each_image.find("img")["src"]
                    images.append(img_link)
            except:
                pass
        except:
            images=[]
            print("No images sry....")

        try :
            div_details=soup_single_item.find("div",class_="entry-summary")
            div_product_details=div_details.find_all("div",class_="prod-specification")
        except :
            break

        
        for each_details in div_product_details:
            try :
                h3_text=each_details.find("h3").text
            except:
                h3_text=""
            if "Brand Name" in h3_text:
                try :
                    product_brand=each_details.find("p").text
                except :
                    product_brand=""
            elif "Category" in h3_text:
                try :
                    product_category=each_details.find("p").text
                except :
                    product_category=""
            elif "Application" in h3_text:
                try :
                    product_application=each_details.find("p").text
                except :
                    product_application=""
            elif "SIZE" in h3_text:
                try :
                    product_size=each_details.find("p").text
                except :
                    product_size=""
            elif "THICKNESS" in h3_text:
                try :
                    product_thickness=each_details.find("p").text
                except :
                    product_thickness=""
            elif "SURFACe" in h3_text:
                try :
                    product_surface=each_details.find("p").text
                except :
                    product_surface=""
            elif "Variation" in h3_text:
                try :
                    product_variation=each_details.find("p").text
                except :
                    product_variation=""
            elif "Slip Resistance" in h3_text:
                try :
                    product_slip_resistance=each_details.find("p").text
                except :
                    product_slip_resistance=""
            elif "PAcKING DETAILS" in h3_text:
                try :
                    product_packing_details=each_details.find("p").text
                except :
                    product_packing_details=""
            elif "USP" in h3_text:
                try :
                    product_usp=each_details.find("div",class_="modal-body").find("img")["src"]
                except :
                    product_usp=""

        try :
            div_wt=soup_single_item.find("div",class_="pckg-tbl-detail").find("table",class_="table table-bordered table-striped table-hover")
            div_wt_table_names=div_wt.find("thead").find("tr").find_all("th")
            div_wt_table_value=div_wt.find("tbody").find("tr").find_all("td")


            for table_element in range(len(div_wt_table_names)):
                text=div_wt_table_names[table_element].text

                if "wt" in div_wt_table_names[table_element].text.lower() :
                    product_wt_per_box=div_wt_table_value[table_element].text
        except:
            product_wt_per_box=""



        try :
            product_application_area={}
            indoor=[]
            outdoor=[]
            commercial=[]
            div_application=soup_single_item.find("div",class_="app-tbl-detail").find("table",class_="table table-bordered table-striped table-hover")
            div_app_tbody=div_application.find("tbody").find_all("tr")


            for each_row in div_app_tbody:
                all_td=each_row.find_all("td")
                application_area=all_td[0].text
                
                if all_td[1].find("i")!=None:
                    indoor.append(application_area)
                if all_td[2].find("i")!=None:
                    outdoor.append(application_area)
                if all_td[3].find("i")!=None:
                    commercial.append(application_area)

            product_application_area={"Indoor" :indoor,"Outdoor" : outdoor,"Commercial":commercial}
            
        except :
            indoor=[]
            outdoor=[]
            commercial=[]
            product_application_area={"Indoor" :indoor,"Outdoor" : outdoor,"Commercial":commercial}

        product_url=url_single_item
        product_img=images
        csv_writer.writerow([product_url, product_name, product_brand,product_category, product_application,product_size , product_thickness
        ,product_surface,product_variation,product_slip_resistance,product_packing_details,product_usp,product_wt_per_box,product_application_area,product_img])
        

      

    
 