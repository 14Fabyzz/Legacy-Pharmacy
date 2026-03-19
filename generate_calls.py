import json

with open('plan.json', 'r', encoding='utf-8') as f:
    plan = json.load(f)

# Combine both lists and treat everything as a replacement
ops = []

for u in plan['updates']:
    # We need the after_id logic for updates too.
    # To get after_id, we need the original blocks sequence.
    pass

# Read blocks sequence again
path = r"C:\Users\LENOVO\.gemini\antigravity\brain\c7b87e36-6d66-454b-bf6d-d9ab91a2848c\blocks_summary.txt"
block_ids = []
try:
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if "|" in line:
                bid = line.split("|")[0].split("]")[1].strip()
                if bid not in block_ids:
                    block_ids.append(bid)
except: pass

def get_after(bid):
    try:
        idx = block_ids.index(bid)
        if idx > 0: return block_ids[idx-1]
    except: pass
    return None

import xml.sax.saxutils as saxutils

tool_calls = []

# Process all 38 ops
all_ops = []
for u in plan['updates']:
    all_ops.append({
        'old_id': u['id'],
        'after_id': get_after(u['id']),
        'new_type': u['type'],
        'rich_text': u['rich_text']
    })

for r in plan['replacements']:
    all_ops.append({
        'old_id': r['old_id'],
        'after_id': r['after_id'], # or get_after
        'new_type': r['new_type'],
        'rich_text': r['rich_text']
    })

for op in all_ops:
    old_id = op['old_id']
    after_id = op['after_id'] if op.get('after_id') else get_after(old_id)
    ntype = op['new_type']
    rt = op['rich_text']
    
    # Clean up rich_text for sending
    clean_rt = []
    for txt in rt:
        t = {"type": "text", "text": {"content": txt["text"]["content"]}}
        # Keep annotations if any
        anns = txt.get("annotations", {})
        clean_anns = {}
        for k in ["bold", "italic", "strikethrough", "underline", "code", "color"]:
            if k in anns and anns[k] is not None:
                if k == "color" and anns[k] == "default": continue
                if anns[k] == False: continue # default
                clean_anns[k] = anns[k]
        if clean_anns:
             t["annotations"] = clean_anns
        clean_rt.append(t)

    # children block
    block_obj = {ntype: {"rich_text": clean_rt}, "type": ntype}
    
    # patch block JSON
    patch_args = {"block_id": "19aef49e-0941-8145-890b-cf15c291930c", "after": after_id, "children": [block_obj]}
    del_args = {"block_id": old_id}
    
    # Create XML tool call string literally
    # We'll just write it down
    call_p = f'\u1205call:default_api:mcp_notion-mcp-server_API-patch-block-children{json.dumps(patch_args, separators=(",", ":"))}\u120B'
    call_d = f'\u1205call:default_api:mcp_notion-mcp-server_API-delete-a-block{json.dumps(del_args, separators=(",", ":"))}\u120B'
    tool_calls.append(call_p + call_d)

with open('tool_calls_raw.txt', 'w', encoding='utf-8') as f:
    # 5 pairs per chunk
    for i in range(0, len(tool_calls), 5):
        chunk = "".join(tool_calls[i:i+5])
        f.write(f"--- CHUNK {i//5} ---\n{chunk}\n\n")

print(f"Generated {len(tool_calls)} operations")
