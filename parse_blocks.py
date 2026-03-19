import json
import os

files = [
    r"C:\Users\LENOVO\.gemini\antigravity\brain\c7b87e36-6d66-454b-bf6d-d9ab91a2848c\.system_generated\steps\14\output.txt",
    r"C:\Users\LENOVO\.gemini\antigravity\brain\c7b87e36-6d66-454b-bf6d-d9ab91a2848c\.system_generated\steps\20\output.txt",
    r"C:\Users\LENOVO\.gemini\antigravity\brain\c7b87e36-6d66-454b-bf6d-d9ab91a2848c\.system_generated\steps\29\output.txt"
]

blocks = []

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if 'results' in data:
                    blocks.extend(data['results'])
            except:
                pass

with open(r"C:\Users\LENOVO\.gemini\antigravity\brain\c7b87e36-6d66-454b-bf6d-d9ab91a2848c\blocks_summary.txt", 'w', encoding='utf-8') as out:
    for i, b in enumerate(blocks):
        btype = b.get('type')
        bid = b.get('id')
        bdata = b.get(btype, {})
        text = ""
        if 'rich_text' in bdata:
            text = "".join([rt.get('plain_text', '') for rt in bdata.get('rich_text', [])])
        elif btype == 'image':
            text = '[IMAGE]'
        
        has_bold_paragraph = False
        if btype == 'paragraph' and 'rich_text' in bdata:
            has_bold_paragraph = any(rt.get('annotations', {}).get('bold', False) for rt in bdata.get('rich_text', []))
            
        out.write(f"[{i}] {bid} | {btype} | BOLD={has_bold_paragraph} | {text[:100]}\n")
        
print(f"Parsed {len(blocks)} blocks")
