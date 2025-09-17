'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Cpu } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'INFTs', href: '/inft', icon: <Cpu className="w-4 h-4" /> },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
                pathname === item.href
                  ? 'bg-indigo-900/50 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      {description && <p className="text-gray-400 text-sm">{description}</p>}
    </div>
  )
}