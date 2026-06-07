import React from 'react'

export default function Sidebar({ currentPage, onNavigate }) {
  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'upload', label: 'Upload', icon: 'upload_file' },
    { id: 'chat', label: 'Chat', icon: 'forum' },
    { id: 'reports', label: 'Reports', icon: 'assessment' }
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-surface-container-lowest border-r border-outline-variant flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 border-2 border-primary rotate-45 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary rotate-[-45deg]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">VaultIQ</h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">Enterprise Intelligence</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 mt-4">
        {links.map((link) => {
          const isActive = currentPage === link.id
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-200 text-left ${
                isActive
                  ? 'text-primary bg-surface-container-high border-r-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-label-caps text-label-caps">{link.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low">
          <img
            alt="User Profile"
            className="w-8 h-8 rounded-full border border-outline object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUYcCTb0kurp5beGZFavmERtKK-iZv4mh3KgmIjjOxbAqSfAlM28VTVH0Ud-e4Zt-wrdfuLLu-zBtJWenMoM5H9VX1L_4mnGqxmi37InrxHub4YOAOE2Drzz3-rcMeMJc9Voic89Psclf3sCc2-Ga21MUV_D07S2uOJjQK6sJ7y3oxBjlMfPnnl-4DsRbcab2J0OF1F5pA_KtzgA0PKVi4K0yd8y7P1NEc5V7tv8lOmHLNTmytUg0sAYZ5XdBoDQlQz5lL_pYz3beB"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">A. Rivera</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Risk Manager</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
