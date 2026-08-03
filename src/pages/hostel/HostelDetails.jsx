import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, ShieldCheck, Star, Users,
  CheckCircle2, CalendarCheck, X, CalendarDays,
  Sparkles, BedDouble, BarChart3, Phone, Info,
} from 'lucide-react'
import { Button, Input, Spinner, EmptyState } from '../../components/common'
import {
  HostelGallery,
  RoomOptionCard,
  AvailabilityBadge,
} from '../../components/hostels'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const SESSIONS = ['2025/2026 Session', '2026/2027 Session']

const EMPTY_FORM = { studentName: '', session: '', moveInDate: '', requiresInspection: true, inspectionDate: '' }

const selectClass = (hasError = false) => cn(
  'w-full h-[42px] px-4 rounded-xl border text-sm text-gray-600 outline-none transition-all duration-200',
  hasError
    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
    : 'border-gray-200 bg-gray-50 focus:border-[#0B5D1E] focus:ring-2 focus:ring-[#0B5D1E]/20 focus:bg-white',
)

const categoryConfig = {
  school:  { label: 'School Hostel',  bg: '#e8f5e9', color: '#0B5D1E' },
  private: { label: 'Private Hostel', bg: '#ede7f6', color: '#6a1b9a' },
}

const genderStyles = {
  Female: { bg: '#fce4ec', color: '#ad1457' },
  Male:   { bg: '#e3f2fd', color: '#1565c0' },
  Mixed:  { bg: '#e8f5e9', color: '#0B5D1E' },
}

const genderGradients = {
  Female: 'linear-gradient(135deg, #AD1457 0%, #880E4F 100%)',
  Male:   'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
  Mixed:  'linear-gradient(135deg, #0B5D1E 0%, #1a7a2e 100%)',
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

export default function HostelDetails() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const { user: authUser } = useAuth()

  const [pageLoading, setPageLoading]   = useState(true)
  const [hostel, setHostel]             = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const [modalOpen, setModalOpen]   = useState(false)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [profile, setProfile]       = useState(null)

  useEffect(() => {
    async function load() {
      const user = await api.getProfile()
      if (user) setProfile(user)

      const found = await api.getFacility(slug)
      if (found) {
        const totalBeds = found.rooms.reduce((s, r) => s + r.totalBeds, 0) || 0
        const availableBeds = found.rooms.reduce((s, r) => s + r.availableBeds, 0) || 0
        const occupancyRate = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0
        let status = 'available'
        if (occupancyRate >= 100) status = 'full'
        else if (occupancyRate >= 80) status = 'limited'
        
        setHostel({
          ...found,
          category: found.type === 'SCHOOL_HOSTEL' ? 'school' : 'private',
          status,
          occupancyRate,
          totalRooms: found.rooms.length,
          availableRooms: found.rooms.filter(r => !r.isOccupied).length,
          priceRange: { min: Number(found.price || 0), max: Number(found.price || 0) },
          gender: found.amenities?.find(a => a.toLowerCase().includes('female only')) ? 'Female'
                : found.amenities?.find(a => a.toLowerCase().includes('male only'))   ? 'Male'
                : 'Mixed',
          distanceFromCampus: found.location?.toLowerCase().includes('campus') ? '0 mins' : '15 mins',
          tags: found.amenities,
          code:                   found.code                   ?? found.slug?.toUpperCase().slice(0, 4),
          availableForInspection: found.availableForInspection ?? true,
          featured:               found.featured               ?? false,
          verified:               found.verified               ?? false,
          rating:                 found.rating                 ?? null,
          reviewCount:            found.reviewCount            ?? 0,
          contact:                found.contact                ?? null,
          rules:                  found.rules                  ?? [],
          roomOptions: found.rooms.map(r => ({
            id: r.id,
            type: r.roomNumber,
            pricePerBed: Number(r.pricePerBed || found.price),
            pricePeriod: 'session',
            capacity: r.totalBeds,
            available: r.isOccupied ? 0 : 1,
            amenities: []
          }))
        })
      }
      setPageLoading(false)
    }
    load()
  }, [slug])

  useEffect(() => {
    if (!modalOpen) return
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalOpen])

  function openBookingModal(room) {
    setSelectedRoom(room)
    setForm({
      ...EMPTY_FORM,
      studentName: authUser?.fullName ?? profile?.fullName ?? '',
      requiresInspection: hostel?.availableForInspection ?? true,
      inspectionDate: new Date().toISOString().split('T')[0],
      session: SESSIONS[0],
      moveInDate: new Date().toISOString().split('T')[0],
    })
    setErrors({})
    setSuccess(false)
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
    setSuccess(false)
  }

  function validate() {
    const e = {}
    if (!form.studentName.trim()) e.studentName = 'Student name is required'
    if (!form.session)            e.session     = 'Please select an academic session'
    if (!form.moveInDate)         e.moveInDate  = 'Please select a move-in date'
    if (form.requiresInspection && !form.inspectionDate) {
      e.inspectionDate = 'Please select a preferred inspection date'
    }
    if (!selectedRoom)            e.duplicate   = 'Please select a room type from the list before booking.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    
    const startTime = new Date(form.moveInDate).toISOString()
    const endTime = new Date(new Date(form.moveInDate).setFullYear(new Date(form.moveInDate).getFullYear() + 1)).toISOString()
    const inspDate = form.requiresInspection && form.inspectionDate ? new Date(form.inspectionDate).toISOString() : null

    const bookingData = {
      facilityId: hostel.id,
      roomId: selectedRoom.id,
      startTime,
      endTime,
      requiresInspection: form.requiresInspection,
      inspectionDate: inspDate,
      purpose: form.requiresInspection ? 'Physical Inspection Request' : 'Direct Room Rental',
    }

    const res = await api.createBooking(bookingData)
    setSubmitting(false)

    if (res?.success || res?.id || res?.status) {
      setSuccess(true)
    } else {
      setErrors({ duplicate: res?.message || 'Failed to submit request.' })
    }
  }

  if (pageLoading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!hostel) {
    return (
      <EmptyState
        title="Hostel not found"
        description="The hostel space you are looking for does not exist or has been removed."
        actionLabel="Back to Hostels"
        onAction={() => navigate('/hostel')}
      />
    )
  }

  const category = categoryConfig[hostel.category] ?? categoryConfig.school
  const gender   = genderStyles[hostel.gender]     ?? genderStyles.Mixed
  const gradient = genderGradients[hostel.gender]  ?? genderGradients.Mixed
  const isFull   = hostel.status === 'full'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/hostel')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Hostel Listings
        </button>

        <div className="flex items-center gap-2">
          {hostel.availableForInspection ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <CalendarDays size={13} className="text-emerald-600" />
              Physical Inspection Available
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Direct Booking Only
            </span>
          )}
          {hostel.verified && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <ShieldCheck size={13} className="text-amber-600" />
              Verified Agent
            </span>
          )}
        </div>
      </div>

      {/* ── Title block ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: category.bg, color: category.color }}
            >
              {category.label}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: gender.bg, color: gender.color }}
            >
              {hostel.gender}
            </span>
            <AvailabilityBadge status={hostel.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            {hostel.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-gray-400" />
              {hostel.location}
            </span>
            <span>·</span>
            <span>{hostel.distanceFromCampus} from FUOYE main gate</span>
          </div>
        </div>

        {/* Pricing chip */}
        <div className="sm:text-right bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex-shrink-0">
          <p className="text-xs text-gray-400 font-medium">Starting Rent</p>
          <p className="text-xl sm:text-2xl font-extrabold text-gray-800 mt-0.5">
            ₦{hostel.priceRange.min.toLocaleString()}
            <span className="text-xs font-medium text-gray-400"> /session</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {hostel.availableRooms} vacant room{hostel.availableRooms === 1 ? '' : 's'} available
          </p>
        </div>
      </div>

      {/* ── Photo gallery ── */}
      <HostelGallery hostel={hostel} />

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          {hostel.description && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <SectionHeader title="About this Space" />
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {hostel.description}
              </p>
            </section>
          )}

          {/* Vacant Rooms */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <SectionHeader
              title="Available Rooms for Rent"
              subtitle="Select a room to reserve or schedule a physical inspection with the caretaker"
            />
            <div className="space-y-3">
              {hostel.roomOptions?.map((room) => (
                <RoomOptionCard
                  key={room.id}
                  roomOption={room}
                  hostelGender={hostel.gender}
                  selected={selectedRoom?.id === room.id}
                  onSelect={(r) => {
                    setSelectedRoom(prev => prev?.id === r.id ? null : r)
                  }}
                />
              ))}
            </div>
          </section>

          {/* Amenities */}
          {hostel.tags?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <SectionHeader title="Amenities & Features" />
              <div className="flex flex-wrap gap-2">
                {hostel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-50 border border-gray-100 text-gray-700"
                  >
                    <Sparkles size={12} className="text-emerald-700" />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right col: Agent contact & booking sidebar */}
        <div className="space-y-6">

          {/* Agent Contact Card */}
          <section className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
            <SectionHeader title="Agent / Caretaker Contact" subtitle="Inquire or schedule a direct viewing" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {hostel.contact?.name?.slice(0, 2).toUpperCase() || 'AG'}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{hostel.contact?.name || 'Listed Agent / Caretaker'}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Verified FUOYE Partner</p>
                </div>
              </div>

              {hostel.contact?.phone && (
                <a
                  href={`tel:${hostel.contact.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  <Phone size={14} />
                  Call Agent: {hostel.contact.phone}
                </a>
              )}
            </div>
          </section>

          {/* Booking CTA sidebar card */}
          {!isFull && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {selectedRoom ? `Selected: Room ${selectedRoom.type}` : 'Reserve a Room'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedRoom ? `₦${selectedRoom.pricePerBed.toLocaleString()} / session` : 'Select a room from the list to book'}
                </p>
              </div>

              <Button
                fullWidth
                icon={CalendarCheck}
                onClick={() => openBookingModal(selectedRoom)}
              >
                {selectedRoom ? 'Schedule Inspection / Reserve' : 'Book Selected Room'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Booking & Inspection Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div className="min-w-0 pr-3">
                <h2 className="text-base font-bold text-gray-800 leading-snug">
                  {success ? 'Request Submitted!' : 'Room Inspection & Reservation'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {success
                    ? 'Your booking details have been registered.'
                    : `${hostel.name}${selectedRoom ? ` · Room ${selectedRoom.type}` : ''}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success screen */}
            {success ? (
              <div className="p-6 flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#e8f5e9' }}
                >
                  <CheckCircle2 size={32} style={{ color: '#0B5D1E' }} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  {form.requiresInspection ? 'Inspection Scheduled!' : 'Room Reserved Successfully!'}
                </h3>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-3">
                  {form.requiresInspection ? (
                    <>
                      Your physical room inspection for <strong className="text-gray-700">{hostel.name} (Room {selectedRoom?.type})</strong> has been set for{' '}
                      <strong className="text-gray-700">
                        {new Date(form.inspectionDate + 'T00:00:00').toLocaleDateString('en-NG', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </strong>. The caretaker has been notified.
                    </>
                  ) : (
                    <>
                      Your room reservation for <strong className="text-gray-700">{hostel.name} (Room {selectedRoom?.type})</strong> has been confirmed.
                    </>
                  )}
                </p>

                {hostel.contact?.phone && (
                  <div className="w-full bg-emerald-50 border border-emerald-100 p-3 rounded-xl mb-4 text-xs text-emerald-800 font-semibold">
                    📞 Caretaker Contact: {hostel.contact.phone}
                  </div>
                )}

                <div className="flex gap-3 w-full">
                  <Button variant="outline" fullWidth onClick={closeModal}>
                    Close
                  </Button>
                  <Button
                    fullWidth
                    icon={CalendarCheck}
                    onClick={() => { closeModal(); navigate('/bookings') }}
                  >
                    View My Pass
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">

                {/* Room summary chip */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-xs"
                    style={{ background: gradient }}
                  >
                    {hostel.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{hostel.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {selectedRoom ? `Room ${selectedRoom.type}` : 'No room type selected'}
                      {selectedRoom && ` · ₦${selectedRoom.pricePerBed.toLocaleString()}/session`}
                    </p>
                  </div>
                  <AvailabilityBadge status={hostel.status} />
                </div>

                {/* Inspection Option Choice (Option A: Schedule Physical Inspection) */}
                {hostel.availableForInspection && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-700 block">
                      Inspection Preference
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 cursor-pointer">
                      <input
                        type="radio"
                        name="requiresInspection"
                        checked={form.requiresInspection}
                        onChange={() => setForm((f) => ({ ...f, requiresInspection: true }))}
                        className="w-4 h-4 text-emerald-700 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Option A: Schedule Physical Inspection</p>
                        <p className="text-[10px] text-emerald-700">Pick a date to view the room in person with the caretaker</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="requiresInspection"
                        checked={!form.requiresInspection}
                        onChange={() => setForm((f) => ({ ...f, requiresInspection: false }))}
                        className="w-4 h-4 text-emerald-700 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-800">Option B: Direct Room Reservation</p>
                        <p className="text-[10px] text-gray-400">Skip physical inspection & reserve room directly</p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Inspection Date (if Option A chosen) */}
                {form.requiresInspection && (
                  <Input
                    label="Preferred Inspection Date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.inspectionDate}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, inspectionDate: e.target.value }))
                      if (errors.inspectionDate) setErrors((er) => ({ ...er, inspectionDate: undefined }))
                    }}
                    error={errors.inspectionDate}
                  />
                )}

                {/* Student name */}
                <Input
                  label="Student Name"
                  placeholder="Your full name"
                  required
                  value={form.studentName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, studentName: e.target.value }))
                    if (errors.studentName) setErrors((er) => ({ ...er, studentName: undefined }))
                  }}
                  error={errors.studentName}
                />

                {/* Session + move-in date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 select-none">
                      Academic Session <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.session}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, session: e.target.value }))
                        if (errors.session) setErrors((er) => ({ ...er, session: undefined }))
                      }}
                      className={selectClass(!!errors.session)}
                    >
                      <option value="">Select session…</option>
                      {SESSIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.session && (
                      <p className="text-red-500 text-[11px]">{errors.session}</p>
                    )}
                  </div>
                  <Input
                    label="Move-in Date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.moveInDate}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, moveInDate: e.target.value }))
                      if (errors.moveInDate) setErrors((er) => ({ ...er, moveInDate: undefined }))
                    }}
                    error={errors.moveInDate}
                  />
                </div>

                {/* Errors */}
                {errors.duplicate && (
                  <div className="p-3 rounded-xl border border-red-100 bg-red-50">
                    <p className="text-red-600 text-xs leading-snug">{errors.duplicate}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" fullWidth disabled={submitting} onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" fullWidth icon={CalendarDays} loading={submitting}>
                    {form.requiresInspection ? 'Schedule Inspection' : 'Confirm Reservation'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
