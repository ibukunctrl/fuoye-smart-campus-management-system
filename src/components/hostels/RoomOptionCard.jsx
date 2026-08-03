import { Users, CheckCircle2, Check } from 'lucide-react'
import { Button } from '../common'
import { cn } from '../../utils/cn'

const genderGradients = {
  Female: 'linear-gradient(135deg, #AD1457 0%, #880E4F 100%)',
  Male:   'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  Mixed:  'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)',
}

function AvailabilityChip({ availableRooms, isFull }) {
  if (isFull) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex-shrink-0">
        Full
      </span>
    )
  }
  if (availableRooms <= 3) {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
        {availableRooms} left
      </span>
    )
  }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 flex-shrink-0">
      {availableRooms} available
    </span>
  )
}

export default function RoomOptionCard({ roomOption, hostelGender, onSelect, selected = false }) {
  const { type, capacity, availableRooms, pricePerBed, pricePeriod, features, images, status } = roomOption

  const isFull   = status === 'full'
  const gradient = genderGradients[hostelGender] ?? genderGradients.Mixed
  const roomImg  = images?.[0] ?? null

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden flex flex-col',
        selected
          ? 'border-[#0B5D1E] shadow-lg ring-1 ring-[#0B5D1E]/20'
          : isFull
          ? 'border-gray-100 opacity-60'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-md',
      )}
    >
      {/* ── Room image ── */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {roomImg ? (
          <img
            src={roomImg}
            alt={type}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: gradient }}>
            <Users size={28} className="text-white opacity-20" />
          </div>
        )}

        {/* Capacity pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)' }}
          >
            <Users size={9} />
            {capacity}-Bed Room
          </span>
        </div>

        {/* Selected checkmark */}
        {selected && (
          <div
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#0B5D1E' }}
          >
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Type + availability */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-gray-800 leading-snug">{type}</h4>
          <AvailabilityChip availableRooms={availableRooms} isFull={isFull} />
        </div>

        {/* Features */}
        <ul className="space-y-1.5">
          {(features || []).slice(0, 4).map((f) => (
            <li key={f} className="flex items-center gap-2 text-[11px] text-gray-500">
              <CheckCircle2 size={11} style={{ color: '#0B5D1E', flexShrink: 0 }} />
              {f}
            </li>
          ))}
          {(features || []).length > 4 && (
            <li className="text-[11px] text-gray-400 pl-5">+{(features || []).length - 4} more</li>
          )}
        </ul>

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-lg font-black text-gray-800">₦{pricePerBed.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400">/{pricePeriod}</span>
          </div>
          <Button
            fullWidth
            size="sm"
            variant={isFull ? 'outline' : selected ? 'secondary' : 'primary'}
            disabled={isFull}
            onClick={() => !isFull && onSelect?.(roomOption)}
          >
            {isFull ? 'No Beds Available' : selected ? '✓ Selected' : 'Select This Room'}
          </Button>
        </div>
      </div>
    </div>
  )
}
