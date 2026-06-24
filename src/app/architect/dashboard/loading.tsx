import Image from 'next/image'

export default function ArchitectDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 font-sans">
      <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto space-y-8">
        
        {/* Header Block Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg w-56 animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-72 animate-pulse" />
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-40 animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16 animate-pulse" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content Tabs Skeleton */}
        <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded-lg w-full max-w-md animate-pulse" />

        {/* Design Grid Skeleton */}
        <div className="space-y-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-36 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[280px]"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-[#0f172a] flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                  <div className="relative w-12 h-12 opacity-20 dark:opacity-10 animate-pulse">
                    <Image
                      src="/logo.svg"
                      alt="Loading..."
                      fill
                      className="dark:invert dark:brightness-[3] dark:hue-rotate-[160deg] object-contain"
                    />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
