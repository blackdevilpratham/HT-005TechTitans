import { useState, useEffect } from 'react';
import type { Page, Patient, Medicine } from '../types';
import { PieChart } from './PieChart';

interface PatientDashboardProps {
  patient: Patient;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

const healthTips = [
  "💧 Stay hydrated — drink at least 8 glasses of water daily.",
  "🥗 Eat a balanced diet rich in fruits and vegetables.",
  "🚶 Walk for at least 30 minutes every day.",
  "😴 Get 7-8 hours of quality sleep each night.",
  "🧘 Practice deep breathing to reduce stress.",
  "📋 Always carry your medicine list when visiting a doctor.",
  "⏰ Take medicines at the same time every day for best results.",
  "🚫 Never skip doses even if you feel better.",
];

export function PatientDashboard({ patient, setPage, onLogout }: PatientDashboardProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'medicines' | 'appointments' | 'tips'>('medicines');
  const [tipIndex, setTipIndex] = useState(0);

  // Form state
  const [courseName, setCourseName] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [time, setTime] = useState('');
  const [totalDays, setTotalDays] = useState('');
  const [doctorAppointment, setDoctorAppointment] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`medi_medicines_${patient.id}`) || '[]');
    setMedicines(stored);
  }, [patient.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const saveMedicines = (meds: Medicine[]) => {
    setMedicines(meds);
    localStorage.setItem(`medi_medicines_${patient.id}`, JSON.stringify(meds));
  };

  const resetForm = () => {
    setCourseName('');
    setMedicineName('');
    setStartDate('');
    setTime('');
    setTotalDays('');
    setDoctorAppointment('');
    setNotes('');
    setImageUrl('');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !medicineName || !startDate || !time || !totalDays) return;

    if (editingId) {
      const updated = medicines.map(m => {
        if (m.id === editingId) {
          return {
            ...m,
            courseName,
            medicineName,
            startDate,
            time,
            totalDays: parseInt(totalDays),
            doctorAppointment,
            notes,
            imageUrl: imageUrl || m.imageUrl,
          };
        }
        return m;
      });
      saveMedicines(updated);
    } else {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        patientId: patient.id,
        courseName,
        medicineName,
        startDate,
        time,
        totalDays: parseInt(totalDays),
        completedDoses: 0,
        imageUrl,
        doctorAppointment,
        notes,
        doseLog: [],
      };
      saveMedicines([...medicines, newMedicine]);
    }
    resetForm();
  };

  const handleEdit = (med: Medicine) => {
    setCourseName(med.courseName);
    setMedicineName(med.medicineName);
    setStartDate(med.startDate);
    setTime(med.time);
    setTotalDays(med.totalDays.toString());
    setDoctorAppointment(med.doctorAppointment);
    setNotes(med.notes);
    setImageUrl(med.imageUrl);
    setEditingId(med.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      saveMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const markDoseTaken = (id: string) => {
    const updated = medicines.map(m => {
      if (m.id === id && m.completedDoses < m.totalDays) {
        return {
          ...m,
          completedDoses: m.completedDoses + 1,
          doseLog: [...m.doseLog, { date: new Date().toISOString(), taken: true }],
        };
      }
      return m;
    });
    saveMedicines(updated);
  };

  const markDoseMissed = (id: string) => {
    const updated = medicines.map(m => {
      if (m.id === id && m.completedDoses < m.totalDays) {
        return {
          ...m,
          doseLog: [...m.doseLog, { date: new Date().toISOString(), taken: false }],
        };
      }
      return m;
    });
    saveMedicines(updated);
  };

  const totalCompleted = medicines.reduce((sum, m) => sum + m.completedDoses, 0);
  const totalRemaining = medicines.reduce((sum, m) => sum + Math.max(0, m.totalDays - m.completedDoses), 0);
  const totalMissed = medicines.reduce((sum, m) => sum + m.doseLog.filter(d => !d.taken).length, 0);
  const upcomingAppointments = medicines.filter(m => m.doctorAppointment && new Date(m.doctorAppointment) >= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      {/* Top Nav */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">💊</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Medi-Reminder
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <span className="text-sm">👋</span>
              <span className="text-sm font-semibold text-blue-700">Hello, {patient.name}</span>
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
        {/* Health Tip Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-sm text-amber-800 font-medium">{healthTips[tipIndex]}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">💊</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Medicines</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{medicines.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">✅</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Doses Done</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{totalCompleted}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg">⏳</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remaining</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">{totalRemaining}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">❌</div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Missed</p>
            </div>
            <p className="text-3xl font-bold text-red-500">{totalMissed}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Progress Chart */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Overall Progress
              </h3>
              <PieChart completed={totalCompleted} remaining={totalRemaining} size={180} />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🩺 Upcoming Appointments
              </h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming appointments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map(med => (
                    <div key={med.id} className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">📅</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{med.courseName}</p>
                        <p className="text-xs text-purple-600 font-medium">
                          {new Date(med.doctorAppointment).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                👤 Patient Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold text-gray-800">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-semibold text-gray-800">{patient.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile</span>
                  <span className="font-semibold text-gray-800">{patient.mobile}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex gap-1">
              {[
                { key: 'medicines' as const, label: '💊 Medicines', },
                { key: 'appointments' as const, label: '🩺 Appointments', },
                { key: 'tips' as const, label: '💡 Health Tips', },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'medicines' && (
              <>
                {/* Add Medicine Button */}
                <button
                  onClick={() => { resetForm(); setShowAddForm(true); }}
                  className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-500 font-bold rounded-2xl hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span> Add New Medicine Course
                </button>

                {/* Add/Edit Form */}
                {showAddForm && (
                  <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingId ? '✏️ Edit Medicine' : '➕ Add New Medicine'}
                      </h3>
                      <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Course Name *</label>
                          <input
                            type="text"
                            value={courseName}
                            onChange={e => setCourseName(e.target.value)}
                            placeholder="e.g., Antibiotic Course"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Medicine Name *</label>
                          <input
                            type="text"
                            value={medicineName}
                            onChange={e => setMedicineName(e.target.value)}
                            placeholder="e.g., Amoxicillin 500mg"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Start Date *</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Dose Time *</label>
                          <input
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Total Days *</label>
                          <input
                            type="number"
                            value={totalDays}
                            onChange={e => setTotalDays(e.target.value)}
                            min="1"
                            placeholder="e.g., 7"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Doctor Appointment Date</label>
                          <input
                            type="date"
                            value={doctorAppointment}
                            onChange={e => setDoctorAppointment(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Medicine Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                      {imageUrl && (
                        <div className="flex items-center gap-3">
                          <img src={imageUrl} alt="Medicine" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200" />
                          <button type="button" onClick={() => setImageUrl('')} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Notes / Instructions</label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="e.g., Take after meals with warm water"
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm resize-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg shadow-blue-200"
                        >
                          {editingId ? 'Update Medicine' : 'Add Medicine'}
                        </button>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Medicine Cards */}
                {medicines.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                    <span className="text-6xl block mb-4">💊</span>
                    <h4 className="text-xl font-bold text-gray-700 mb-2">No Medicines Added Yet</h4>
                    <p className="text-gray-400 text-sm">Click the button above to add your first medicine course</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicines.map(med => {
                      const progress = med.totalDays > 0 ? Math.round((med.completedDoses / med.totalDays) * 100) : 0;
                      const isComplete = med.completedDoses >= med.totalDays;
                      return (
                        <div
                          key={med.id}
                          className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                            isComplete ? 'border-green-200' : 'border-gray-100'
                          }`}
                        >
                          <div className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-start gap-4 flex-1">
                                {med.imageUrl ? (
                                  <img src={med.imageUrl} alt={med.medicineName} className="w-14 h-14 object-cover rounded-xl border-2 border-gray-100 flex-shrink-0" />
                                ) : (
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💊</div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-gray-800">{med.medicineName}</h4>
                                    {isComplete && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg">✓ Completed</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-0.5">Course: {med.courseName}</p>
                                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">📅 {new Date(med.startDate).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1">⏰ {med.time}</span>
                                    <span className="flex items-center gap-1">📆 {med.totalDays} days</span>
                                  </div>
                                  {med.notes && (
                                    <p className="text-xs text-blue-500 mt-2 bg-blue-50 inline-block px-2 py-1 rounded-lg">📝 {med.notes}</p>
                                  )}
                                  {med.doctorAppointment && (
                                    <p className="text-xs text-purple-500 mt-1">
                                      🩺 Next appointment: {new Date(med.doctorAppointment).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-1.5">
                                  {!isComplete && (
                                    <>
                                      <button
                                        onClick={() => markDoseTaken(med.id)}
                                        className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-lg hover:bg-green-100 transition-all"
                                      >
                                        ✓ Taken
                                      </button>
                                      <button
                                        onClick={() => markDoseMissed(med.id)}
                                        className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                                      >
                                        ✕ Missed
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleEdit(med)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDelete(med.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-semibold text-gray-500">
                                  {med.completedDoses} / {med.totalDays} doses
                                </span>
                                <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                                  {progress}%
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isComplete
                                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                      : progress >= 50
                                      ? 'bg-gradient-to-r from-blue-400 to-teal-500'
                                      : 'bg-gradient-to-r from-orange-400 to-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Dose Log */}
                            {med.doseLog.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {med.doseLog.slice(-14).map((log, i) => (
                                  <div
                                    key={i}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${
                                      log.taken ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                                    }`}
                                    title={`${new Date(log.date).toLocaleDateString()} - ${log.taken ? 'Taken' : 'Missed'}`}
                                  >
                                    {log.taken ? '✓' : '✕'}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">🩺 All Doctor Appointments</h3>
                {medicines.filter(m => m.doctorAppointment).length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-5xl block mb-3">📅</span>
                    <p className="text-gray-400">No appointments scheduled. Add them in your medicine courses.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicines
                      .filter(m => m.doctorAppointment)
                      .sort((a, b) => new Date(a.doctorAppointment).getTime() - new Date(b.doctorAppointment).getTime())
                      .map(med => {
                        const isPast = new Date(med.doctorAppointment) < new Date();
                        return (
                          <div key={med.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isPast ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isPast ? 'bg-gray-200 text-gray-600' : 'bg-blue-500 text-white'}`}>
                              <span className="text-lg">{new Date(med.doctorAppointment).getDate()}</span>
                              <span className="text-[10px]">{new Date(med.doctorAppointment).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">{med.courseName}</p>
                              <p className="text-sm text-gray-500">{med.medicineName}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isPast ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                              {isPast ? 'Past' : 'Upcoming'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">💡 Health Tips & Suggestions</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: '⏰', title: 'Set Fixed Times', desc: 'Take medicines at the same time daily to build a routine. Set phone alarms as backup reminders.' },
                    { icon: '🍽️', title: 'Follow Instructions', desc: 'Some medicines work better with food, some on empty stomach. Follow your doctor\'s advice.' },
                    { icon: '💧', title: 'Stay Hydrated', desc: 'Drink plenty of water when taking medications to help absorption and reduce side effects.' },
                    { icon: '📝', title: 'Keep a Log', desc: 'Track your doses here in Medi-Reminder. Mark taken/missed to maintain accurate records.' },
                    { icon: '🚫', title: 'Never Double Dose', desc: 'If you miss a dose, don\'t take two at once. Consult your doctor for guidance.' },
                    { icon: '🏥', title: 'Regular Checkups', desc: 'Keep your doctor appointments and discuss any side effects or concerns you have.' },
                    { icon: '📸', title: 'Photo Your Meds', desc: 'Upload images of your medicines to avoid confusion between similar-looking pills.' },
                    { icon: '👨‍👩‍👦', title: 'Involve Family', desc: 'Share your progress with caretakers. They can help remind you and track your adherence.' },
                  ].map((tip, i) => (
                    <div key={i} className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 border border-teal-100 hover:shadow-md transition-shadow">
                      <span className="text-2xl block mb-2">{tip.icon}</span>
                      <h4 className="font-bold text-gray-800 text-sm mb-1">{tip.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
