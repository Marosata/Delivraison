'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = {
  role: 'admin' | 'livreur';
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/commandes', label: 'Commandes' },
    { href: '/admin/commandes/nouvelle', label: 'Nouvelle Commande' },
  ];

  const livreurLinks = [
    { href: '/livreur/dashboard', label: 'Dashboard' },
    { href: '/livreur/commandes', label: 'Mes Commandes' },
    { href: '/livreur/historique', label: 'Historique' },
  ];

  const links = role === 'admin' ? adminLinks : livreurLinks;

  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-white/10 flex flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-zinc-100">
          {role === 'admin' ? 'Admin Panel' : 'Livreur Panel'}
        </h2>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[#b08d2a] text-black'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-100'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link
          href="/auth/logout"
          className="block w-full px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-zinc-100 text-center"
        >
          Déconnexion
        </Link>
      </div>
    </div>
  );
}
