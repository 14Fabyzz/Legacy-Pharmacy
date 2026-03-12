import json
import os
import re

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
            except Exception as e:
                print(f"Error loading {filepath}: {e}")

old_block_ids = [b['id'] for b in blocks]

new_blocks = []
h1_used = False

def create_text(content, is_bold=False, is_italic=False):
    return {
        "type": "text",
        "text": {"content": content},
        "annotations": {
            "bold": is_bold,
            "italic": is_italic,
            "strikethrough": False,
            "underline": False,
            "code": False,
            "color": "default"
        }
    }

def convert_block(b):
    global h1_used
    btype = b.get('type')
    bdata = b.get(btype, {})
    
    if btype in ['image', 'table', 'column_list', 'table_of_contents', 'divider']:
        # Keep as is, just clean up internal structure for appending
        if btype == 'image':
            return {"type": "image", "image": bdata}
        if btype == 'divider':
            return {"type": "divider", "divider": {}}
        if btype == 'table_of_contents':
            return {"type": "table_of_contents", "table_of_contents": {}}
        # Tables and column lists are complex to duplicate via block children if they have nested content.
        # But we must try or skip. Notion API doesn't support appending tables directly without children.
        # Let's skip complex blocks replication for now, or just leave them. Wait! I can't easily deep-copy column_lists.
        # Let's just keep the text and simple blocks, and for images/tables...
        # Wait, if I delete the old blocks, I lose the images and tables!
        # DANG! Notion API does not return image URLs for internal images (they expire).
        # And tables require copying all table rows.
        pass

# Ah, I cannot just delete and replace everything if there are images and tables.
# I will lose the internal images!
