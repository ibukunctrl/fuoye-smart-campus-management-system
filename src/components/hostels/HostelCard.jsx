import { MapPin, Star, ShieldCheck, ChevronRight, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AvailabilityBadge from './AvailabilityBadge'
import { cn } from '../../utils/cn'

const genderGradients = {
  Female: 'linear-gradient(135deg, #AD1457 0%, #880E4F 100%)',
  Male:   'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  Mixed:  'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)',
}

const categoryStyles = {
  school:  { label: 'School',  bg: 'rgba(232,245,233,0.95)', color: '#0B5D1E' },
  private: { label: 'Private', bg: 'rgba(237,231,246,0.95)', color: '#6a1b9a' },
}

const genderStyles = {
  Female: { bg: 'rgba(252,228,236,0.95)', color: '#ad1457' },
  Male:   { bg: 'rgba(227,242,253,0.95)', color: '#1565c0' },
  Mixed:  { bg: 'rgba(232,245,233,0.95)', color: '#0B5D1E' },
}

export default function HostelCard({ hostel }) {
  const navigate = useNavigate()
  const {
    slug, code, name, gender, category, location, status,
    imageUrl, images, priceRange, verified, rating, reviewCount,
    distanceFromCampus, distanceFromGate, featured,
  } = hostel

  const gradient     = genderGradients[gender] ?? genderGradients.Mixed
  const catStyle     = categoryStyles[category] ?? categoryStyles.school
  const genderStyle  = genderStyles[gender] ?? genderStyles.Mixed
  // DB imageUrl takes priority; fall back to legacy static import
  const thumbnail    = imageUrl ?? images?.thumbnail ?? images?.outdoor?.[0] ?? null
  const distance     = distanceFromCampus ?? distanceFromGate ?? null

  return (
    <div
      onClick={() => navigate(`/hostel/${slug}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* ── Image ─────────────────────────────────────────────────────────── */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: gradient }}>
            <span className="text-white text-4xl font-black opacity-20 tracking-widest select-none">{code}</span>
          </div>
        )}

        {/* Scrim gradient for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Top-left: category + optional limited badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm"
            style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
          >
            {catStyle.label}
          </span>
          {status === 'limited' && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(4px)' }}>
              <Flame size={8} />
              Limited
            </span>
          )}
        </div>

        {/* Top-right: availability */}
        <div className="absolute top-2.5 right-2.5">
          <AvailabilityBadge status={status} />
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2 flex-1">

        {/* Name + verified + chevron */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              {/* Gender pill */}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: genderStyle.bg, color: genderStyle.color }}
              >
                {gender}
              </span>
              {verified && (
                <ShieldCheck size={12} className="flex-shrink-0" style={{ color: '#0B5D1E' }} />
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-1">{name}</h3>
          </div>
          <ChevronRight
            size={15}
            className="text-gray-200 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors duration-200"
          />
        </div>

        {/* Rating (private only) */}
        {rating && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={10}
                className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
                fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="text-[11px] font-semibold text-amber-600 ml-0.5">{rating.toFixed(1)}</span>
            {reviewCount && (
              <span className="text-[10px] text-gray-400">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={11} className="flex-shrink-0 text-gray-400" />
          <span className="truncate">{location}</span>
          {distance && (
            <span className="text-gray-400 flex-shrink-0">· {distance}</span>
          )}
        </div>

        {/* Price + CTA row */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between">
          <div>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">From</p>
            <p className="text-sm font-black text-gray-800 leading-none">
              ₦{priceRange.min.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">per session</p>
          </div>
          <span
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200 group-hover:opacity-90"
            style={{ backgroundColor: '#0B5D1E', color: '#fff' }}
          >
            View Details
          </span>
        </div>
      </div>
    </div>
  )
}
