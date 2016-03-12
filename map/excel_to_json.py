#========================================================================================
#Abu Dhabi bus trip planner
#2016
#heplper Python script  - converts routes data in Excel format into 
#javascript data scripts. Tested and works with Python 3.4
#To use, place data files into map/excel folder
#generated scripts will be placed into map/js_data folder
#All this could be done on the server side. 
#========================================================================================
import os
import xlrd
import csv
import json
import glob
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

def save_excel_as_csv(excel_file_name, csv_file_name, remove_empty_rows=False):
    with xlrd.open_workbook(excel_file_name) as wb:
        sh = wb.sheet_by_index(0)  # or wb.sheet_by_name('name_of_the_sheet_here')
        csv_file = open(csv_file_name, 'w', encoding='utf-8', newline='')
        wr = csv.writer(csv_file, quoting=csv.QUOTE_NONNUMERIC)

        for rownum in range(sh.nrows):
            include = True 
            if remove_empty_rows and (str(sh.row_values(rownum)[0])==""):
                include = False
            if  include: 
                lw = list(); 
                for item in sh.row_values(rownum):
                    if isinstance(item, float):
                        if ((item % 1)==0.0):
                            item = int(item)
                    lw.append(item)
                wr.writerow(lw)

        csv_file.close()

def csv_to_js(csvfile_name_and_path, js_file_name_and_path, var_name):
    csv_to_json(csvfile_name_and_path, js_file_name_and_path, var_name)

def csv_to_json(csvfile_name_and_path, json_file_name_and_path, var_name = ""):
    csvfile = open(csvfile_name_and_path, 'r')
    jsonfile = open(json_file_name_and_path, 'w')
    reader = csv.DictReader(csvfile)
    ld = [r for r in reader]

    filtered_list = list()

    for d in ld:
        for key in d:
            if is_number(d[key]):
                d[key]=float(d[key])
                if ((d[key] % 1)==0.0):
                    d[key]=str(int(d[key]))
        filtered_list.append(d)

    data = json.dumps(filtered_list, indent=4)
    if not (var_name ==""):
      data = "var " + var_name + " = "  + data
      data = data + ";"
    jsonfile.write(data)
    #reader.close()
    jsonfile.close()
    csvfile.close()

def excel_file_to_js(excel_file_name, js_file_dir):
    current_directory = os.path.dirname(os.path.realpath(__file__))
    csv_file  =  current_directory + r"\temp.csv"
    var_name = os.path.splitext(os.path.basename(excel_file_name))[0]
    save_excel_as_csv(excel_file_name, csv_file, True)
    js_file_name = js_file_dir + "\\"  + var_name + ".js"
    csv_to_js(csv_file, js_file_name, var_name)
    #os.remove(csv_file)


current_directory = os.path.dirname(os.path.realpath(__file__))
excel_files_directory = current_directory+ r"\excel"
js_files_directory = current_directory + r"\js_data"
excel_files = glob.glob(excel_files_directory + r"\*.*")
for excel_file in excel_files:
    excel_file_to_js(excel_file, js_files_directory)


