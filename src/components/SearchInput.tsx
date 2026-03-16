"use client"

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchInput() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="relative max-w-lg mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#00f2ff]" />
            </div>
            <input
                className="block w-full pl-10 pr-3 py-3 border-2 border-transparent border-b-[#00a3ad] dark:border-b-[#00f2ff] bg-gray-50 dark:bg-gray-900/50 backdrop-blur-md placeholder-gray-500 focus:outline-none focus:border-[#00f2ff] focus:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all duration-300 font-mono text-sm text-gray-900 dark:text-[#f8fafc]"
                placeholder="SEARCH_DESIGNS..."
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
            />
        </div>
    )
}
