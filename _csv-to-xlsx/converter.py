'''
usage:
-> place the .csv's to be converted in ./data
-> make sure ./xlified-data exists. converted .xlsx's will be stored there
'''

import os
import pandas as pd

def xlify(path):
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        target_path = f'./xlified-data{item_path[6:]}'
        print(target_path)
        if os.path.isfile(item_path):
            if item_path[-4:] == '.csv':
                csv_file = pd.read_csv(item_path)
                xlsx_file = pd.ExcelWriter(f'{target_path[:-4]}.xlsx')
                csv_file.to_excel(xlsx_file, index = False)
                xlsx_file.save()
        if os.path.isdir(item_path):
            if os.path.exists(target_path) == False:
                os.makedirs(target_path)
            xlify(item_path)



if __name__ == '__main__':
    path = './data'
    xlify(path)
