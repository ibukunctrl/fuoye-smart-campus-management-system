import { useState, useEffect } from 'react'
import { Users, Database, BookOpen, Info, Loader2, Calendar } from 'lucide-react'
import { api } from '../../services/api'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStudents() {
      const users = await api.getAllUsers()
      if (users) {
        setStudents(users.filter(u => u.role === 'STUDENT'))
      }
      setLoading(false)
    }
    loadStudents()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 size={32} className="animate-spin text-green-700" />
      </div>
    )
  }

  const totalBookings = students.reduce((sum, s) => sum + (s.bookings?.length || 0), 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Students</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Registered students on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Registered Students', value: students.length, icon: Users,   color: '#0B5D1E', bg: '#e8f5e9' },
          { label: 'Total Student Bookings', value: totalBookings,      icon: Database, color: '#6a1b9a', bg: '#ede7f6' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Student list */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">All Students</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#0B5D1E' }}
                >
                  {student.fullName ? student.fullName.substring(0, 2).toUpperCase() : student.matricNumber.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{student.fullName}</p>
                  <p className="text-[10px] font-mono text-gray-500">{student.matricNumber}</p>
                </div>
                <div className="flex-1 min-w-0 hidden sm:block">
                  <p className="text-[11px] text-gray-600">{student.department || 'No department'}</p>
                  <p className="text-[10px] text-gray-400">{student.level ? `${student.level} Level` : ''}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ backgroundColor: '#e8f5e9', color: '#0B5D1E' }}
                  >
                    <Calendar size={10} />
                    {student.bookings?.length || 0} Bookings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <Users size={32} className="text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No students found</p>
          <p className="text-xs text-gray-300 mt-1">Students will appear here once they register</p>
        </div>
      )}
    </div>
  )
}
