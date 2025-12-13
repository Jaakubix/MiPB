import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as zf:
            xml_content = zf.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        text = []
        for p in tree.findall('.//w:p', namespace):
            paragraph_text = []
            for t in p.findall('.//w:t', namespace):
                if t.text:
                    paragraph_text.append(t.text)
            if paragraph_text:
                text.append(''.join(paragraph_text))
        
        return '\n'.join(text)
    except Exception as e:
        return f"Error reading {docx_path}: {e}"

files = [
    "Leave Request Test Scenario.docx",
    "Decorations and Medals Test Scenario.docx",
    "Change of Employment Conditions Test Scenario.docx"
]

base_path = os.getcwd()

for file_name in files:
    full_path = os.path.join(base_path, file_name)
    print(f"--- Content of {file_name} ---")
    print(extract_text_from_docx(full_path))
    print("\n" + "="*30 + "\n")
