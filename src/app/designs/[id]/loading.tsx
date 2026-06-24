import Image from 'next/image'

export default function DesignDetailLoading() {
  return (
    <div className="min-h-screen bg-transparent py-12 font-sans">
      <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Left Column: Image Gallery Skeleton */}
          <div className="flex flex-col space-y-4">
            {/* Main Image Container */}
            <div className="aspect-[4/3] w-full rounded-xl bg-slate-100 dark:bg-[#0f172a] relative flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <div className="relative w-24 h-24 opacity-25 dark:opacity-15 animate-pulse">
                <Image
                  src="/logo.svg"
                  alt="Loading..."
                  fill
                  className="dark:invert dark:brightness-[3] dark:hue-rotate-[160deg] object-contain"
                />
              </div>
            </div>
            {/* Thumbnails grid */}
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] w-full rounded-lg bg-slate-200 dark:bg-slate-850 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Info & Action Buttons Skeleton */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 space-y-6">
            <div className="space-y-2">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
            </div>

            {/* Description Text Skeletons */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5 animate-pulse" />
            </div>

            {/* Room specs grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-12 animate-pulse" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>

            {/* CTAs skeletons */}
            <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-full animate-pulse" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
