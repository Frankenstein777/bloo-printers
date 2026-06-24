import Image from 'next/image'

export default function CatalogLoading() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
      <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-10 space-y-3">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 mx-auto animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-96 mx-auto animate-pulse" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="max-w-3xl mx-auto h-12 bg-slate-200 dark:bg-slate-850 rounded-lg mb-8 animate-pulse" />

        {/* Results Info Skeleton */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse" />
        </div>

        {/* Design Cards Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-card border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[350px]"
            >
              {/* Thumbnail Placeholder */}
              <div className="w-full h-44 bg-slate-100 dark:bg-[#0f172a] relative flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                <div className="relative w-12 h-12 opacity-20 dark:opacity-10 animate-pulse">
                  <Image
                    src="/logo.svg"
                    alt="Loading..."
                    fill
                    className="dark:invert dark:brightness-[3] dark:hue-rotate-[160deg] object-contain"
                  />
                </div>
              </div>

              {/* Text Skeletons */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse" />
                </div>
                <div className="pt-2 border-t border-slate-150 dark:border-slate-850 flex justify-between items-center">
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20 animate-pulse" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-8 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
