package com.guo.app;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;


import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;


import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

public class XlsCompose {

    private String fileName;
    private String str;
    XlsCompose(){}
    XlsCompose(String f,String s){
        fileName =f ;
        str = s;
    }


    public Workbook readExcel() throws Exception{
        FileInputStream is =null;
        try{
            is = new FileInputStream(new File(str+File.separator+fileName));
            if(fileName.toLowerCase().endsWith("xlsx")){
                return new XSSFWorkbook(is);
            }else if(fileName.toLowerCase().endsWith("xls")){
                return new HSSFWorkbook(is);
            }else{
                System.out.print("file format error");
            }
        }catch (IOException e){
            throw e;
        }finally {
            IOUtils.closeQuietly(is);
        }
        return null;
    }

    public ArrayList<String> readContents(Workbook book){
        Sheet sheet = book.getSheetAt(0);
        ArrayList<String> contents = new ArrayList();
        for (int rowNum = 0; rowNum <= sheet.getLastRowNum(); rowNum++) {
            Row row = sheet.getRow(rowNum);
            if (row == null) {
                continue;
            }
            for (int cellNum = 0; cellNum <= row.getLastCellNum(); cellNum++) {
                Cell cell = row.getCell(cellNum);
                if (cell == null) {
                    continue;
                }
                contents.add(cell.getStringCellValue());
            }
        }
        return contents;
    }

    public boolean contents2Csv(ArrayList<String> al){

            for (int j = al.size() - 1; j >= 0; j--) {
                composeSynonyms(al.get(j));
            }
        boolean flag = true;
        // for completing the fullpath
        String fullPath = str + File.separator + fileName + ".csv";
        // create the json file
        try {
            File file = new File(fullPath);
            if (!file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }
            if (file.exists()) { // if the file with the same name exist ,delete it
                file.delete();
            }
            file.createNewFile();

            // write the JsonString to the file
            Writer write = new OutputStreamWriter(new FileOutputStream(file), "UTF-8");
            for (int j =0;j <= al.size()-1 ; j ++) {
                for(String element: composeSynonyms(al.get(j))){
                    write.write(element+",");
                }
                write.write("\n");
            }
            write.flush();
            write.close();
        } catch (Exception e) {
            flag = false;
            e.printStackTrace();
        }
        if (flag) {
            System.out.println("Success: write entities into the file");
        }
        // return the flag of success
        return flag;
    }


    public  static List<String> composeSynonyms(String s){
        List<String> alist = new ArrayList();
        for(String a: s.split(" ")){
            String pattern = "^[0-9]*$|^ème$|^le$|^la$|^[a-zA-Z]$|^et$|^pour$|^ne$|^plus$|^pas$";// ^de$|  ^du$|   ^des$|  ^à$|

            if( !Pattern.matches(pattern, a) ){
                alist.add(a);
            }
        }
        //System.out.println(alist);
        return intergrateSynonyms(alist);
    }

    public static List<String> intergrateSynonyms(List<String> composeList){
        ArrayList intergrateList= new ArrayList();
        int size = composeList.size();
        if(size ==1){
            intergrateList.add(composeList.get(0));
        }else{
            for(int i=1; i<size;i++){
                String s = new String();
                for(int j=0; j<= i;j++) {
                    s += composeList.get(j);
                    s += " ";
                }

                intergrateList.add(s);
            }
        }
            System.out.println(intergrateList);
        return intergrateList;
    }

    public static void main(String[] args){
        String fileName = "123.xlsx";
        String str = "E:\\Documents\\Techniques\\Desktop\\data_from_ CARLSource\\data_CS_csv";
        XlsCompose x = new XlsCompose(fileName,str);
        try {
            ArrayList<String> as = x.readContents(x.readExcel());
            x.contents2Csv(as);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

