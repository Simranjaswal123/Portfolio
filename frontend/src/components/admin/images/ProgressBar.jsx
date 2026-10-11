// A simple upload progress bar. "value" is 0-100.
function ProgressBar({ value, label, className = '' }) {
  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200"
      >
        <div className="h-full bg-gray-900 transition-[width] duration-150" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-600">{value}%</p>
    </div>
  )
}

export default ProgressBar
