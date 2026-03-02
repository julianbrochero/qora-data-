import os
import re

files = [
    "src/components/modules/Facturacion.jsx",
    "src/components/modules/Clientes.jsx",
    "src/components/modules/Productos.jsx",
    "src/components/modules/ControlCaja.jsx",
    "src/components/modules/Reportes.jsx",
    "src/components/modules/Proveedores.jsx",
    "src/components/modules/Pedidos.jsx",
    "src/components/modules/Configuracion.jsx"
]

for filename in files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add "Menu" to imports if not there
    if 'Menu' not in content:
        content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\']', r'import {\1, Menu} from "lucide-react"', content)
    
    # 2. Add onOpenMobileSidebar to props if not there
    # Look for: const Facturacion = ({ ... }) => {
    # It might be multiline.
    if 'onOpenMobileSidebar' not in content:
        content = re.sub(r'(const \w+\s*=\s*\(\{)([^}]*?)(\}\)\s*=>\s*\{)', 
                         lambda m: m.group(1) + m.group(2) + (", onOpenMobileSidebar" if not m.group(2).endswith(',') else " onOpenMobileSidebar") + m.group(3),
                         content, count=1)

    # 3. Add the Menu button before the title
    # Look for: <header style={{ ... }}>
    #             <div>
    #               <p ...
    
    pattern = r'(<header[^>]*>\s*)((?:<div[^>]*>\s*)?<p[^>]*>.*?<\/p>\s*<h2[^>]*>.*?<\/h2>\s*(?:<\/div>))'
    
    replacement = r'''\1<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onOpenMobileSidebar} className="md:hidden w-[30px] h-[30px] rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <Menu size={16} strokeWidth={2} />
          </button>
          \2
        </div>'''
        
    if 'md:hidden' not in content:
        content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filename}")
    else:
        print(f"Already fixed or not matched: {filename}")
