import Image from 'next/image'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-muted/50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto">
        {/* Header Profile Section Skeleton */}
        <div className="bg-brand-navy rounded-2xl border border-slate-800 p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Avatar circle */}
          <div className="w-24 h-24 rounded-full bg-slate-850 animate-pulse border-4 border-slate-800" />
          
          {/* Name & Bio lines */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="h-8 bg-slate-850 rounded-md w-48 mx-auto md:mx-0 animate-pulse" />
            <div className="h-4 bg-slate-850 rounded w-64 mx-auto md:mx-0 animate-pulse" />
            <div className="h-4 bg-slate-850 rounded w-full max-w-2xl mx-auto md:mx-0 animate-pulse" />
          </div>
          
          {/* Action button */}
          <div className="h-10 bg-slate-850 rounded-lg w-28 animate-pulse" />
        </div>

        {/* Purchase Items List Skeleton */}
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
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
                    <div className="flex gap-3">
                      <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1 animate-pulse" />
                      <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
