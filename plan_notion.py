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
            except: pass

# Remove duplicates based on ID (since different steps might overlap)
unique_blocks = []
seen_ids = set()
for b in blocks:
    if b['id'] not in seen_ids:
        unique_blocks.append(b)
        seen_ids.add(b['id'])

blocks = unique_blocks

updates_needed = []
replacements_needed = []

h1_used = False

for i, b in enumerate(blocks):
    btype = b.get('type')
    if btype not in ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'bulleted_list_item', 'numbered_list_item', 'quote', 'callout']:
        continue
        
    bdata = b.get(btype, {})
    rich_text = bdata.get('rich_text', [])
    if not rich_text:
        continue
        
    full_text = "".join([rt.get('plain_text', '') for rt in rich_text])
    is_fully_bold = all(rt.get('annotations', {}).get('bold', False) for rt in rich_text if rt.get('plain_text').strip())
    
    nuevo_tipo = btype
    
    # Logic for type
    if re.match(r'^Manual de Usuario', full_text, re.IGNORECASE) and not h1_used:
        nuevo_tipo = 'heading_1'
        h1_used = True
    elif re.match(r'^\d+\.\s+[A-Z]', full_text) or full_text.isupper() or full_text == 'Tabla de Contenido.':
        nuevo_tipo = 'heading_2'
    elif re.match(r'^\d+\.\d+\.?\s+[A-Z]', full_text) or re.match(r'^Paso \d+:', full_text, re.IGNORECASE) or re.match(r'^[A-Z]\.\s', full_text):
        nuevo_tipo = 'heading_3'
    elif re.match(r'^(nota|importante|advertencia):', full_text, re.IGNORECASE) or '⚠️' in full_text:
        nuevo_tipo = 'quote'
    else:
        # If it was a header but doesn't match above, and is short, maybe keep it.
        if btype in ['heading_1', 'heading_2', 'heading_3']:
            # Downgrade based on format maybe?
            if len(full_text) > 80:
                nuevo_tipo = 'paragraph'
                
    # Logic for bold text
    # If the text is a header, bold doesn't matter (Notion makes it bold anyway, but we can set it to false).
    # If it's a paragraph or list, we remove bold IF the entire paragraph is bold.
    needs_rich_text_update = False
    new_rich_text = json.loads(json.dumps(rich_text)) # Deep copy
    
    if nuevo_tipo in ['paragraph', 'bulleted_list_item', 'numbered_list_item', 'quote']:
        if is_fully_bold:
            for rt in new_rich_text:
                if rt.get('annotations', {}).get('bold'):
                    rt['annotations']['bold'] = False
                    needs_rich_text_update = True
    
    if nuevo_tipo != btype:
        prec_id = blocks[i-1]['id'] if i > 0 else None
        replacements_needed.append({
            'old_id': b['id'],
            'after_id': prec_id,
            'old_type': btype,
            'new_type': nuevo_tipo,
            'text': full_text[:50],
            'rich_text': new_rich_text
        })
    elif needs_rich_text_update:
        updates_needed.append({
            'id': b['id'],
            'type': btype,
            'text': full_text[:50],
            'rich_text': new_rich_text
        })

print(f"Blocks evaluated: {len(blocks)}")
print(f"Updates (in-place) needed: {len(updates_needed)}")
print(f"Replacements (delete & insert) needed: {len(replacements_needed)}")

with open('plan.json', 'w', encoding='utf-8') as f:
    json.dump({
        'updates': updates_needed,
        'replacements': replacements_needed
    }, f, indent=2)
