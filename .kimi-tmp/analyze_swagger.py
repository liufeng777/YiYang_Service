import json
from pathlib import Path

root = Path(__file__).parent
spec = json.loads((root / 'swagger.json').read_text(encoding='utf-8'))
lines = []
compact = []
for path, methods in spec.get('paths', {}).items():
    for method, operation in methods.items():
        if method.lower() not in {'get', 'post', 'put', 'delete', 'patch'}:
            continue
        lines.append(f"\n## {method.upper()} {path}")
        lines.append(f"summary: {operation.get('summary', '')}")
        lines.append(f"tags: {', '.join(operation.get('tags', []))}")
        params = operation.get('parameters', [])
        for param in params:
            location = param.get('in', '')
            name = param.get('name', '')
            required = 'required' if param.get('required') else 'optional'
            desc = param.get('description', '')
            if location == 'body':
                schema = param.get('schema', {})
                lines.append(f"- body {name} ({required}) {desc}: {json.dumps(schema, ensure_ascii=False)}")
            else:
                lines.append(f"- {location} {name}: {param.get('type', '')} ({required}) {desc}")
        responses = operation.get('responses', {})
        success = responses.get('200') or responses.get('201') or {}
        lines.append(f"response: {json.dumps(success.get('schema', {}), ensure_ascii=False)}")
        compact.append({'method': method.upper(), 'path': path, 'summary': operation.get('summary', ''), 'tags': operation.get('tags', []), 'parameters': params, 'response': success.get('schema', {})})
(root / 'swagger-summary.txt').write_text('\n'.join(lines), encoding='utf-8')
(root / 'swagger-compact.json').write_text(json.dumps(compact, ensure_ascii=False, indent=2), encoding='utf-8')
definition_lines = []
for name, definition in spec.get('definitions', {}).items():
    definition_lines.append(f"\n## {name}")
    definition_lines.append(json.dumps(definition, ensure_ascii=False, indent=2))
(root / 'swagger-definitions.txt').write_text('\n'.join(definition_lines), encoding='utf-8')
print(f"operations={len(compact)} paths={len(spec.get('paths', {}))} definitions={len(spec.get('definitions', {}))}")
for item in compact:
    print(f"{item['method']:6} {item['path']}  {item['summary']}")
