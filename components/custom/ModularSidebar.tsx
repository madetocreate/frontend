import Link from 'next/link'
export default function ModularSidebar() {
  const menu = [
    { href: '/chat', label: 'Chat' },
    { href: '/kommunikation', label: 'Kommunikation' },
    { href: '/organisation', label: 'Organisation' },
    { href: '/memory', label: 'Memory' },
    { href: '/settings', label: 'Einstellungen' }
  ]
  return (
    <nav className="space-y-2 p-4">
      {menu.map(item => (
        <Link key={item.href} href={item.href} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
