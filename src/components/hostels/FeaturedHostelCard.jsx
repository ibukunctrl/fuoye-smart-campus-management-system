import { MapPin, Star, ShieldCheck, ArrowRight, Sparkles, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AvailabilityBadge from './AvailabilityBadge'

const genderGradients = {
  Female: 'linear-gradient(135deg, #AD1457 0%, #880E4F 100%)',
  Male:   'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  Mixed:  'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)',
}

const categoryStyles = {
  school:  { label: 'School',  bg: '#e8f5e9', color: '#0B5D1E' },
  private: { label: 'Private', bg: '#ede7f6', color: '#6a1b9a' },
}

const genderStyles = {
  Female: { bg: '#fce4ec', color: '#ad1457' },
  Male:   { bg: '#e3f2fd', color: '#1565c0' },
  Mixed:  { bg: '#e8f5e9', color: '#0B5D1E' },
}

export default function FeaturedHostelCard({ hostel }) {
  const navigate = useNavigate()
  const {
    slug, code, name, gender, category, location, status,
    imageUrl, images, priceRange, verified, rating, reviewCount,
    shortDescription, amenities,
    distanceFromCampus, distanceFromGate,
  } = hostel

  const gradient    = genderGradients[gender] ?? genderGradients.Mixed
  const catStyle    = categoryStyles[category] ?? categoryStyles.school
  const genderStyle = genderStyles[gender] ?? genderStyles.Mixed
  // DB imageUrl takes priority; fall back to legacy static import
  const thumbnail   = imageUrl ?? images?.thumbnail ?? images?.outdoor?.[0] ?? null
  const distance    = distanceFromCampus ?? distanceFromGate ?? null


  return (
    <div
      onClick={() => navigate(`/hostel/${slug}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col sm:flex-row"
      style={{ minHeight: 220 }}
    >
      {/* ── Image panel: full-width on mobile, 38% fixed on sm+ ── */}
      <div
        className="relative w-full sm:w-[38%] h-48 sm:h-auto flex-shrink-0 overflow-hidden"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            style={{ display: 'block' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: gradient }}
          >
            <span className="text-white text-5xl font-black opacity-15 tracking-widest select-none">
              {code}
            </span>
          </div>
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

        {/* FEATURED badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <Sparkles size={9} />
          FEATURED
        </div>

        {/* Availability — bottom-left */}
        <div className="absolute bottom-3 left-3">
          <AvailabilityBadge status={status} />
        </div>

        {/* Limited — bottom-right */}
        {status === 'limited' && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: 'rgba(239,68,68,0.85)' }}
          >
            <Flame size={9} />
            Book Soon
          </div>
        )}
      </div>

      {/* ── Content panel ── */}
      <div className="p-4 sm:p-5 flex flex-col gap-2.5 flex-1 min-w-0 overflow-hidden">

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
          >
            {catStyle.label}
          </span>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: genderStyle.bg, color: genderStyle.color }}
          >
            {gender}
          </span>
          {verified && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: '#e8f5e9', color: '#0B5D1E' }}
            >
              <ShieldCheck size={10} />
              FUOYE Verified
            </span>
          )}
        </div>

        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-1 flex-1">{name}</h3>
          {rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={12} fill="#f59e0b" className="text-amber-400" />
              <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
              {reviewCount && (
                <span className="text-[10px] text-gray-400">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={11} className="flex-shrink-0 text-gray-400" />
          <span className="truncate">{location}</span>
          {distance && <span className="text-gray-400 flex-shrink-0">· {distance}</span>}
        </div>

        {/* Short description — hidden on very small, shown on sm+ */}
        {shortDescription && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 hidden sm:block">
            {shortDescription}
          </p>
        )}

        {/* Amenity pills */}
        {amenities?.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
              >
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer — price + CTA, always visible */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Starting from</p>
            <p className="text-base font-black text-gray-800 leading-none">
              ₦{priceRange.min.toLocaleString()}
              <span className="text-[11px] font-normal text-gray-400"> /session</span>
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{ backgroundColor: '#0B5D1E' }}
            onClick={(e) => { e.stopPropagation(); navigate(`/hostel/${slug}`) }}
          >
            View Details
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
