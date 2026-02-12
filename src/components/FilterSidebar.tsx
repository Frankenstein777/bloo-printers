'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function FilterSidebar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)

    // State for filters
    const [filters, setFilters] = useState({
        minBedrooms: searchParams.get('minBedrooms') || '0',
        minFloors: searchParams.get('minFloors') || '0',
        matchMode: searchParams.get('matchMode') || 'min', // 'min' or 'exact'
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

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        // Bedrooms
        if (Number(filters.minBedrooms) > 0) params.set('minBedrooms', filters.minBedrooms)
        else params.delete('minBedrooms')

        // Floors
        if (Number(filters.minFloors) > 0) params.set('minFloors', filters.minFloors)
        else params.delete('minFloors')

        // Match Mode
        if (filters.matchMode === 'exact') params.set('matchMode', 'exact')
        else params.delete('matchMode')

        // Area
        if (filters.minArea) params.set('minArea', filters.minArea)
        else params.delete('minArea')

        if (filters.maxArea) params.set('maxArea', filters.maxArea)
        else params.delete('maxArea')

        // Features
        if (filters.hasPenthouse) params.set('hasPenthouse', 'true')
        else params.delete('hasPenthouse')

        if (filters.hasBQ) params.set('hasBQ', 'true')
        else params.delete('hasBQ')

            // Software
            ;['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF'].forEach(sw => {
                if ((filters as any)[`sw_${sw}`]) params.set(`sw_${sw}`, 'true')
                else params.delete(`sw_${sw}`)
            })

        router.push(`/browse?${params.toString()}`)
        setIsOpen(false)
    }

    return (
        <>
            {/* Mobile/Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 left-6 z-40 bg-indigo-600 text-white p-3 rounded-full shadow-lg"
            >
                <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </button>

            {/* Sidebar / Desktop Panel */}
            <div className={`
                fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out
                lg:relative lg:transform-none lg:w-64 lg:block lg:shadow-none lg:bg-transparent
                ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full overflow-y-auto p-6 border-l border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6 lg:hidden">
                        <h2 className="text-xl font-bold dark:text-white">Filters</h2>
                        <button onClick={() => setIsOpen(false)}>
                            <XMarkIcon className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Match Mode Toggle */}
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-sm">
                            <button
                                onClick={() => handleFilterChange('matchMode', 'min')}
                                className={`flex-1 py-1.5 rounded-md transition-colors ${filters.matchMode === 'min' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Minimum
                            </button>
                            <button
                                onClick={() => handleFilterChange('matchMode', 'exact')}
                                className={`flex-1 py-1.5 rounded-md transition-colors ${filters.matchMode === 'exact' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Exact
                            </button>
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {filters.matchMode === 'exact' ? 'Exact' : 'Min'} Bedrooms: {filters.minBedrooms}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={filters.minBedrooms}
                                onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                            />
                        </div>

                        {/* Floors */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {filters.matchMode === 'exact' ? 'Exact' : 'Min'} Floors: {filters.minFloors}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                value={filters.minFloors}
                                onChange={(e) => handleFilterChange('minFloors', e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                            />
                        </div>

                        {/* Land Area */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Land Area (sqm)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minArea}
                                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                                    className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxArea}
                                    onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                                    className="w-full rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm"
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Must have</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={filters.hasPenthouse}
                                        onChange={(e) => handleFilterChange('hasPenthouse', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Penthouse</span>
                                </label>
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={filters.hasBQ}
                                        onChange={(e) => handleFilterChange('hasBQ', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Boys Quarters</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Apply Filters
                        </button>
                    </div>

                    {/* Software Compatibility */}
                    <div className="mt-6 border-t pt-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Software Format</h3>
                        <div className="space-y-2">
                            {['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF'].map((sw) => (
                                <label key={sw} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={(filters as any)[`sw_${sw}`] || false}
                                        onChange={(e) => handleFilterChange(`sw_${sw}`, e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{sw.toLowerCase()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
