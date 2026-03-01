import re

with open('c:/FacturaPRO/sistema-facturacion/src/components/modules/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix MetricCard lines and colors
content = re.sub(
    r'const MetricCard =.*?return \(\s*(<div className="[^"]*?")>',
    r'const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendType }) => {\n  const trendColor =\n    trendType === \'up\'\n      ? \'text-[#10b981]\'\n      : trendType === \'down\'\n        ? \'text-[#e11d48]\'\n        : \'text-[#6b7280]\'\n\n  return (\n    <div className="relative p-5 rounded-2xl overflow-hidden transition-all cursor-default bg-[#ffffff] border border-[#e5e7eb] shadow-sm flex flex-col justify-between">\n      {/* Accent bar top */}\n      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#f94f27]" />',
    content,
    flags=re.DOTALL
)

subs = [
    ('bg-white', 'bg-[#ffffff]'),
    ('text-gray-900', 'text-[#111827]'),
    ('text-gray-800', 'text-[#1f2937]'),
    ('text-gray-700', 'text-[#374151]'),
    ('text-gray-600', 'text-[#4b5563]'),
    ('text-gray-500', 'text-[#6b7280]'),
    ('text-gray-400', 'text-[#9ca3af]'),
    ('text-gray-300', 'text-[#d1d5db]'),
    ('bg-gray-50', 'bg-[#f9fafb]'),
    ('bg-gray-100', 'bg-[#f3f4f6]'),
    ('border-gray-100', 'border-[#f3f4f6]'),
    ('border-gray-200', 'border-[#e5e7eb]'),
    ('border-gray-300', 'border-[#d1d5db]'),
    ('bg-[#F5F6F8]', 'bg-[#f0f0f1]'),
    ('md:rounded-tl-[32px] border-l-0 md:border-l md:border-t border-gray-200', 'md:border-l border-[#e5e7eb]')
]

for old, new in subs:
    content = content.replace(old, new)


header_start = content.find('<header')
header_end = content.find('</header>') + 9

new_header = """<header className="flex items-center justify-between px-6 md:px-8 h-16 shrink-0 border-b bg-[#373F47] border-[#2E3740]">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl w-full max-w-[280px] border transition-all bg-[#2E3740] border-[#424B54] focus-within:border-[#555d68]">
          <Search size={14} className="text-[#8B8982]" strokeWidth={2} />
          <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-[13px] w-full font-medium text-[#ffffff] placeholder-[#8B8982]" />
          <kbd className="text-[9px] font-bold px-1.5 py-0.5 rounded border ml-auto shrink-0 bg-[#2E3740] text-[#8B8982] border-[#424B54]">⌘K</kbd>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={() => openModal && openModal('nuevo-pedido')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f94f27] hover:bg-[#e03e18] text-[#ffffff] rounded-lg text-[12px] font-bold transition-all active:scale-95 shadow-[0_1px_4px_rgba(249,79,39,0.3)]"><Plus size={13} strokeWidth={2.5} /> Nuevo Pedido</button>
            <button onClick={() => openModal && openModal('nuevo-cliente')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95 border bg-[#2E3740] border-[#424B54] text-[#8B8982] hover:text-[#ffffff] hover:border-[#555d68]"><UserPlus size={13} strokeWidth={2} /> Cliente</button>
            <button onClick={() => openModal && openModal('nuevo-producto')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95 border bg-[#2E3740] border-[#424B54] text-[#8B8982] hover:text-[#ffffff] hover:border-[#555d68]"><PackagePlus size={13} strokeWidth={2} /> Producto</button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95 border bg-[#2E3740] border-[#424B54] text-[#8B8982] hover:text-[#ffffff] hover:border-[#555d68]"><BarChart3 size={13} strokeWidth={2} /> Reportes</button>
          </div>
          <div className="w-px h-6 mx-1 bg-[#2E3740]" />
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors bg-[#2E3740] border-[#424B54] text-[#8B8982] hover:text-[#ffffff] hover:border-[#555d68]"><Moon size={15} strokeWidth={2} /></button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors bg-[#2E3740] border-[#424B54] text-[#8B8982] hover:text-[#ffffff] hover:border-[#555d68]"><Bell size={15} strokeWidth={2} /></button>
          <div className="flex items-center gap-2.5 cursor-pointer pl-1">
            <div className="hidden lg:block text-right">
              <p className="text-[12px] font-semibold leading-tight text-[#ffffff]">{nombreUsuario}</p>
              <p className="text-[10px] text-[#8B8982]">{user?.email || 'admin@gestify.com'}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] overflow-hidden border bg-[#1E2226] text-[#ffffff] border-[#424B54]">
              {user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Perfil" className="w-full h-full object-cover" /> : (user?.email ? user.email.charAt(0).toUpperCase() : 'A')}
            </div>
          </div>
        </div>
      </header>"""

content = content[:header_start] + new_header + content[header_end:]

with open('c:/FacturaPRO/sistema-facturacion/src/components/modules/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
