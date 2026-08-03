import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, Expand } from 'lucide-react'
import { cn } from '../../utils/cn'

const genderGradients = {
  Female: 'linear-gradient(135deg, #AD1457 0%, #880E4F 100%)',
  Male:   'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  Mixed:  'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)',
}

const VIEW_TABS = [
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Indoor',  value: 'indoor' },
]

export default function HostelGallery({ hostel }) {
  const { gender, images, name, imageUrl } = hostel
  const [activeTab, setActiveTab]     = useState('outdoor')
  const [activeIndex, setActiveIndex] = useState(0)

  // Prepend the Cloudinary imageUrl to the outdoor gallery if it exists
  const rawOutdoor = images?.outdoor ?? []
  const outdoor    = imageUrl ? [imageUrl, ...rawOutdoor.filter(img => img !== imageUrl)] : rawOutdoor
  const indoor     = images?.indoor ?? []

  const photos    = activeTab === 'outdoor' ? outdoor : indoor
  const hasPhotos = photos.length > 0
  const gradient  = genderGradients[gender] ?? genderGradients.Mixed
  const safeIndex = Math.min(activeIndex, Math.max(photos.length - 1, 0))

  function prev() {
    setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1))
  }

  function next() {
    setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0))
  }

  function switchTab(tab) {
    setActiveTab(tab)
    setActiveIndex(0)
  }

  const outdoorCount = outdoor.length
  const indoorCount  = indoor.length

  return (
    <div className="space-y-3">

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1">
        {VIEW_TABS.map(({ label, value }) => {
          const count   = value === 'outdoor' ? outdoorCount : indoorCount
          const isActive = activeTab === value
          return (
            <button
              key={value}
              onClick={() => switchTab(value)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border',
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
              )}
              style={isActive ? { backgroundColor: '#0B5D1E', borderColor: '#0B5D1E' } : {}}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Main image viewer ── */}
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-100 select-none"
        style={{ height: 340 }}
      >
        {hasPhotos ? (
          <>
            <img
              src={photos[safeIndex]}
              alt={`${name} ${activeTab} view ${safeIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Bottom gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

            {/* Navigation arrows — only when multiple photos */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                >
                  <ChevronRight size={18} />
                </button>

                {/* Photo count pill */}
                <div
                  className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                >
                  {safeIndex + 1} / {photos.length}
                </div>
              </>
            )}

            {/* View type label */}
            <div
              className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white capitalize"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            >
              {activeTab} view
            </div>
          </>
        ) : (
          /* ── Placeholder ── */
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: gradient }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <ImageOff size={26} className="text-white opacity-60" />
            </div>
            <p className="text-white/60 text-xs font-medium">
              {activeTab === 'outdoor' ? 'Outdoor' : 'Indoor'} photos coming soon
            </p>
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {hasPhotos && photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex-shrink-0 w-[72px] h-[52px] rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === safeIndex
                  ? 'border-[#0B5D1E] ring-2 ring-[#0B5D1E]/20 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90',
              )}
            >
              <img
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
