'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SearchBar() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace, push } = useRouter()

    const [filtersOpen, setFiltersOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setFiltersOpen(false)
            }
        }
        if (filtersOpen) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [filtersOpen])

    // Search
    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) params.set('q', term)
        else params.delete('q')
        replace(`${pathname}?${params.toString()}`)
    }

    // Filters state
    const [filters, setFilters] = useState({
        minBedrooms: searchParams.get('minBedrooms') || '0',
        minFloors: searchParams.get('minFloors') || '0',
        matchMode: searchParams.get('matchMode') || 'min',
        minArea: searchParams.get('minArea') || '',
        maxArea: searchParams.get('maxArea') || '',
        hasPenthouse: searchParams.get('hasPenthouse') === 'true',
        hasBQ: searchParams.get('hasBQ') === 'true',
        sw_REVIT: searchParams.get('sw_REVIT') === 'true',
        sw_ARCHICAD: searchParams.get('sw_ARCHICAD') === 'true',
        sw_SKETCHUP: searchParams.get('sw_SKETCHUP') === 'true',
        sw_AUTOCAD: searchParams.get('sw_AUTOCAD') === 'true',
        sw_PDF: searchParams.get('sw_PDF') === 'true',
    })

    const set = (key: string, value: any) => setFilters(prev => ({ ...prev, [key]: value }))

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        Number(filters.minBedrooms) > 0 ? params.set('minBedrooms', filters.minBedrooms) : params.delete('minBedrooms')
        Number(filters.minFloors) > 0 ? params.set('minFloors', filters.minFloors) : params.delete('minFloors')
        filters.matchMode === 'exact' ? params.set('matchMode', 'exact') : params.delete('matchMode')
        filters.minArea ? params.set('minArea', filters.minArea) : params.delete('minArea')
        filters.maxArea ? params.set('maxArea', filters.maxArea) : params.delete('maxArea')
        filters.hasPenthouse ? params.set('hasPenthouse', 'true') : params.delete('hasPenthouse')
        filters.hasBQ ? params.set('hasBQ', 'true') : params.delete('hasBQ');
        ['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF'].forEach(sw => {
            (filters as any)[`sw_${sw}`] ? params.set(`sw_${sw}`, 'true') : params.delete(`sw_${sw}`)
        })
        push(`/catalog?${params.toString()}`)
        setFiltersOpen(false)
    }

    const clearFilters = () => {
        const params = new URLSearchParams()
        const q = searchParams.get('q')
        if (q) params.set('q', q)
        push(`/catalog?${params.toString()}`)
        setFilters({ minBedrooms: '0', minFloors: '0', matchMode: 'min', minArea: '', maxArea: '', hasPenthouse: false, hasBQ: false, sw_REVIT: false, sw_ARCHICAD: false, sw_SKETCHUP: false, sw_AUTOCAD: false, sw_PDF: false })
        setFiltersOpen(false)
    }

    // Count active filters
    const activeCount = [
        Number(filters.minBedrooms) > 0,
        Number(filters.minFloors) > 0,
        !!filters.minArea || !!filters.maxArea,
        filters.hasPenthouse,
        filters.hasBQ,
        filters.sw_REVIT, filters.sw_ARCHICAD, filters.sw_SKETCHUP, filters.sw_AUTOCAD, filters.sw_PDF,
    ].filter(Boolean).length

    return (
        <div ref={panelRef} className="w-full max-w-3xl mx-auto relative font-sans">
            {/* Search + Filter toggle row */}
            <div className="flex gap-2 items-stretch">
                {/* Search */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-brand-teal" />
                    </div>
                    <input
                        className="block w-full h-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-800 border-b-brand-teal dark:border-b-brand-teal bg-slate-50 dark:bg-slate-900/50 placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:shadow-[0_0_15px_rgba(14,154,167,0.15)] transition-all duration-300 text-sm text-slate-800 dark:text-slate-200 rounded-lg cursor-none"
                        placeholder="Search blueprints..."
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('q')?.toString()}
                    />
                </div>

                {/* Filter button */}
                <button
                    onClick={() => setFiltersOpen(o => !o)}
                    className={`relative flex items-center gap-2 px-4 py-3 border rounded-lg text-sm font-semibold transition-all duration-200 cursor-none
                        ${filtersOpen || activeCount > 0
                            ? 'border-brand-teal text-brand-teal bg-brand-teal/10 shadow-[0_0_12px_rgba(14,154,167,0.2)]'
                            : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-brand-teal hover:text-brand-teal'
                        }`}
                    aria-label="Toggle filters"
                >
                    <AdjustmentsHorizontalIcon className="h-4 w-4 flex-none" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-teal text-white text-[10px] font-bold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Collapsible filter panel */}
            {filtersOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-navy shadow-2xl p-6 rounded-xl animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Match mode */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-2 uppercase tracking-wider">Match Mode</label>
                            <div className="flex gap-2">
                                {['min', 'exact'].map(mode => (
                                    <button key={mode} onClick={() => set('matchMode', mode)}
                                        className={`flex-1 py-2 text-xs font-medium uppercase border rounded-md transition-all cursor-none ${filters.matchMode === mode ? 'border-brand-teal text-brand-teal bg-brand-teal/10 font-bold' : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-brand-teal hover:text-brand-teal'}`}>
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-2 uppercase tracking-wider">
                                {filters.matchMode === 'exact' ? 'Exact' : 'Min'} Bedrooms: <span className="text-brand-teal font-extrabold">{filters.minBedrooms}</span>
                            </label>
                            <input type="range" min="0" max="10" value={filters.minBedrooms}
                                onChange={e => set('minBedrooms', e.target.value)}
                                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded appearance-none cursor-none accent-brand-teal" />
                        </div>

                        {/* Floors */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-2 uppercase tracking-wider">
                                {filters.matchMode === 'exact' ? 'Exact' : 'Min'} Floors: <span className="text-brand-teal font-extrabold">{filters.minFloors}</span>
                            </label>
                            <input type="range" min="0" max="5" value={filters.minFloors}
                                onChange={e => set('minFloors', e.target.value)}
                                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded appearance-none cursor-none accent-brand-teal" />
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-2 uppercase tracking-wider">Land Area (sqm)</label>
                            <div className="flex gap-2">
                                <input type="number" placeholder="Min" value={filters.minArea} onChange={e => set('minArea', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-brand-teal outline-none p-2 text-xs text-slate-800 dark:text-slate-200 rounded" />
                                <input type="number" placeholder="Max" value={filters.maxArea} onChange={e => set('maxArea', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-brand-teal outline-none p-2 text-xs text-slate-800 dark:text-slate-200 rounded" />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-2 uppercase tracking-wider">Must Have</label>
                            <div className="flex flex-wrap gap-2">
                                {[{ key: 'hasPenthouse', label: 'Penthouse' }, { key: 'hasBQ', label: 'Boys Quarters' }].map(f => (
                                    <button key={f.key} onClick={() => set(f.key, !(filters as any)[f.key])}
                                        className={`px-3 py-1.5 text-xs border rounded-full transition-all cursor-none ${(filters as any)[f.key] ? 'border-brand-teal text-brand-teal bg-brand-teal/10 font-semibold' : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-brand-teal'}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Software */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-2 uppercase tracking-wider">Software Format</label>
                            <div className="flex flex-wrap gap-2">
                                {['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF'].map(sw => (
                                    <button key={sw} onClick={() => set(`sw_${sw}`, !(filters as any)[`sw_${sw}`])}
                                        className={`px-2.5 py-1 text-xs border rounded transition-all cursor-none ${(filters as any)[`sw_${sw}`] ? 'border-brand-teal text-brand-teal bg-brand-teal/10 font-semibold' : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-brand-teal'}`}>
                                        {sw}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action row */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button onClick={applyFilters}
                            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-brand-teal hover:bg-brand-teal/90 text-white rounded transition-all duration-200 cursor-none">
                            Apply Filters
                        </button>
                        <button onClick={clearFilters}
                            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-slate-800 text-slate-500 hover:border-red-500 hover:text-red-500 rounded transition-all duration-200 cursor-none">
                            Clear
                        </button>
                        <button onClick={() => setFiltersOpen(false)}
                            className="px-3 py-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-none" aria-label="Close">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
