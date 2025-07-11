export default function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-muted rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="w-full h-48 bg-slate-300 dark:bg-slate-700"></div>
          <div className="p-4">
            <div className="h-6 w-3/4 mb-2 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-1/2 mb-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-full bg-slate-300 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
