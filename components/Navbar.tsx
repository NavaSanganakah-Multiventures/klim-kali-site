"use client"
import * as React from "react"
import Link from "next/link"
import { Menu, X, User } from "lucide-react"
import { useAuth } from "./AuthProvider"
import { LoginModal } from "./LoginModal"

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false)
  const { user, logout } = useAuth()

  const links = [
    { name: "मुख्य पृष्ठ", href: "/#home" },
    { name: "लाइव दर्शन", href: "/live-darshan" },
    { name: "समय व आयोजन", href: "/#timings" },
    { name: "सेवाएँ", href: "/#services" },
    { name: "आचार्य", href: "/#acharya" },
    { name: "गैलरी", href: "/#gallery" },
    { name: "सेवा व दान", href: "/#donation" },
    { name: "ब्लॉग व सूचनाएं", href: "/#blog" },
  ]

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl">
                  क
                </div>
                <span className="font-bold text-2xl text-orange-900">काली माता मंदिर</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-orange-950 hover:text-orange-600 font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-orange-900 font-medium bg-orange-50 px-3 py-1.5 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="text-sm max-w-[150px] truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-orange-600 hover:text-red-700 font-medium text-sm"
                  >
                    लॉगआउट
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-orange-600 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-700 transition"
                  suppressHydrationWarning
                >
                  लॉगिन करें
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              {!user && (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full font-medium"
                  suppressHydrationWarning
                >
                  लॉगिन
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-orange-900 hover:text-orange-600 focus:outline-none"
              >
                {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-orange-100">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              {user && (
                <div className="px-3 py-2 mb-2 flex items-center justify-between bg-orange-50 rounded-md">
                  <div className="flex items-center gap-2 text-orange-900 font-medium">
                    <User className="w-4 h-4" />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                  <button onClick={logout} className="text-sm text-red-600 font-medium">लॉगआउट</button>
                </div>
              )}
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-orange-950 hover:text-orange-600 hover:bg-orange-50"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}
