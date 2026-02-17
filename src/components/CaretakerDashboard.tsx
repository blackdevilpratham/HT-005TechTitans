import { useState, useEffect } from 'react';
import type { Page, Patient, Caretaker, Medicine } from '../types';
import { PieChart } from './PieChart';

interface CaretakerDashboardProps {
  caretaker: Caretaker;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

export function CaretakerDashboard({ caretaker, setPage, onLogout }: CaretakerDashboardProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'log'>('overview');

  useEffect(() => {
    const patients: Patient[] = JSON.parse(localStorage.getItem('medi_patients') || '[]');
    const found = patients.find(p => p.email === caretaker.patientEmail);
    if (found) {
      setPatient(found);
      const meds = JSON.parse(localStorage.getItem(`medi_medicines_${found.id}`) || '[]');
      setMedicines(meds);
    }
  }, [caretaker.patientEmail]);

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    if (!patient) return;
    const interval = setInterval(() => {
      const meds = JSON.parse(localStorage.getItem(`medi_medicines_${patient.id}`) || '[]');
      setMedicines(meds);
    }, 5000);
    return () => clearInterval(interval);
  }, [patient]);

  const totalCompleted = medicines.reduce((sum, m) => sum + m.completedDoses, 0);
  const totalRemaining = medicines.reduce((sum, m) => sum + Math.max(0, m.totalDays - m.completedDoses), 0);
  const totalMissed = medicines.reduce((sum, m) => sum + m.doseLog.filter(d => !d.taken).length, 0);
  const totalDoses = medicines.reduce((sum, m) => sum + m.totalDays, 0);
  const adherenceRate = totalDoses > 0 ? Math.round(((totalCompleted) / (totalCompleted + totalMissed || 1)) * 100) : 0;

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-12 shadow-xl border border-purple-100 max-w-md">
          <span className="text-6xl block mb-4">😕</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Patient Not Found</h2>
          <p className="text-gray-500 mb-6">The patient with email <span className="font-semibold text-purple-600">{caretaker.patientEmail}</span> hasn't registered yet.</p>
          <button
            onClick={() => { onLogout(); setPage('landing'); }}
            className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50">
      {/* Top Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">👁️</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Medi-Reminder
              </span>
              <span className="text-[10px] ml-2 bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase">Caretaker View</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl">
              <span className="text-sm">👨‍👩‍👦</span>
              <span className="text-sm font-semibold text-purple-700">{caretaker.name}</span>
            </div>
            <button
              onClick={() => { onLogout(); setPage('landing'); }}
              className="px-4 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Read-only banner */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Read-Only Access</p>
            <p className="text-xs text-amber-600">You can view the patient's medication reports but cannot edit or delete any data.</p>
          </div>
        </div>

        {/* Patient Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">
                🧑‍⚕️
              </div>
              <div>
                <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider">Monitoring Patient</p>
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <p className="text-purple-200 text-sm">{patient.email} • {patient.mobile}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{medicines.length}</p>
                <p className="text-xs text-purple-200">Medicines</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{adherenceRate}%</p>
                <p className="text-xs text-purple-200">Adherence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">💊</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Courses</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{medicines.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">✅</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doses Taken</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{totalCompleted}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg">⏳</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remaining</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">{totalRemaining}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">❌</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Missed</p>
            </div>
            <p className="text-3xl font-bold text-red-500">{totalMissed}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex gap-1 mb-6">
          {[
            { key: 'overview' as const, label: '📊 Overview' },
            { key: 'details' as const, label: '💊 Medicine Details' },
            { key: 'log' as const, label: '📋 Dose History' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeView === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Overall Dose Progress</h3>
              <PieChart completed={totalCompleted} remaining={totalRemaining} size={200} />
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Per-Medicine Progress</h3>
                {medicines.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">No medicines added by patient yet.</p>
                ) : (
                  <div className="space-y-4">
                    {medicines.map(med => {
                      const progress = med.totalDays > 0 ? Math.round((med.completedDoses / med.totalDays) * 100) : 0;
                      const isComplete = med.completedDoses >= med.totalDays;
                      return (
                        <div key={med.id}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700">{med.medicineName}</span>
                              {isComplete && <span className="text-xs text-green-600">✓</span>}
                            </div>
                            <span className="text-xs font-bold text-gray-500">{med.completedDoses}/{med.totalDays}</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                isComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-400 to-pink-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming appointments */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🩺 Patient Appointments</h3>
                {medicines.filter(m => m.doctorAppointment).length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">No appointments scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {medicines
                      .filter(m => m.doctorAppointment)
                      .sort((a, b) => new Date(a.doctorAppointment).getTime() - new Date(b.doctorAppointment).getTime())
                      .map(med => {
                        const isPast = new Date(med.doctorAppointment) < new Date();
                        return (
                          <div key={med.id} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${isPast ? 'bg-gray-50' : 'bg-purple-50'}`}>
                            <span className="text-lg">{isPast ? '✅' : '📅'}</span>
                            <div className="flex-1">
                              <span className="font-semibold text-gray-700">{med.courseName}</span>
                              <span className="text-gray-400 mx-2">—</span>
                              <span className="text-gray-500">{new Date(med.doctorAppointment).toLocaleDateString()}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-purple-200 text-purple-700'}`}>
                              {isPast ? 'Done' : 'Upcoming'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'details' && (
          <div className="space-y-4">
            {medicines.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                <span className="text-6xl block mb-4">💊</span>
                <p className="text-gray-400">The patient hasn't added any medicines yet.</p>
              </div>
            ) : (
              medicines.map(med => {
                const progress = med.totalDays > 0 ? Math.round((med.completedDoses / med.totalDays) * 100) : 0;
                const isComplete = med.completedDoses >= med.totalDays;
                const missedCount = med.doseLog.filter(d => !d.taken).length;
                return (
                  <div key={med.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isComplete ? 'border-green-200' : 'border-gray-100'}`}>
                    <div className="p-6">
                      <div className="flex flex-wrap items-start gap-4">
                        {med.imageUrl ? (
                          <img src={med.imageUrl} alt={med.medicineName} className="w-16 h-16 object-cover rounded-xl border-2 border-gray-100" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-3xl">💊</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-bold text-gray-800">{med.medicineName}</h4>
                            {isComplete && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg">✓ Completed</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Course: {med.courseName}</p>
                          <div className="grid sm:grid-cols-3 gap-3 mt-3 text-xs">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <span className="text-gray-400 block">Start Date</span>
                              <span className="font-semibold text-gray-700">{new Date(med.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <span className="text-gray-400 block">Dose Time</span>
                              <span className="font-semibold text-gray-700">{med.time}</span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <span className="text-gray-400 block">Duration</span>
                              <span className="font-semibold text-gray-700">{med.totalDays} days</span>
                            </div>
                          </div>
                          {med.notes && (
                            <p className="text-xs text-blue-500 mt-3 bg-blue-50 inline-block px-3 py-1.5 rounded-lg">📝 {med.notes}</p>
                          )}
                          {med.doctorAppointment && (
                            <p className="text-xs text-purple-600 mt-2">🩺 Appointment: {new Date(med.doctorAppointment).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="text-center">
                          <PieChart completed={med.completedDoses} remaining={Math.max(0, med.totalDays - med.completedDoses)} size={100} />
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-green-600">{med.completedDoses}</p>
                          <p className="text-[10px] font-semibold text-green-500 uppercase">Taken</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-orange-600">{Math.max(0, med.totalDays - med.completedDoses)}</p>
                          <p className="text-[10px] font-semibold text-orange-500 uppercase">Remaining</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-red-500">{missedCount}</p>
                          <p className="text-[10px] font-semibold text-red-400 uppercase">Missed</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500 font-semibold">Progress</span>
                          <span className="text-xs font-bold text-purple-600">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-400 to-pink-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeView === 'log' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6">📋 Complete Dose History</h3>
            {medicines.every(m => m.doseLog.length === 0) ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-3">📋</span>
                <p className="text-gray-400">No dose history recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {medicines.filter(m => m.doseLog.length > 0).map(med => (
                  <div key={med.id}>
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                      {med.medicineName}
                      <span className="text-xs text-gray-400 font-normal">({med.courseName})</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left px-4 py-2 rounded-l-lg text-xs font-semibold text-gray-500 uppercase">#</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                            <th className="text-left px-4 py-2 rounded-r-lg text-xs font-semibold text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {med.doseLog.map((log, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {new Date(log.date).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  log.taken ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                }`}>
                                  {log.taken ? '✓ Taken' : '✕ Missed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>🔄 Data auto-refreshes every 5 seconds • 🔒 Read-only access for caretakers</p>
        </div>
      </div>
    </div>
  );
}
