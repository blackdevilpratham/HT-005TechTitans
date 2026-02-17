import type { Page } from '../types';

interface LandingPageProps {
  setPage: (page: Page) => void;
}

export function LandingPage({ setPage }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white text-lg">💊</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Medi-Reminder
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPage('patient-login')}
              className="px-5 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200"
            >
              Patient Login
            </button>
            <button
              onClick={() => setPage('caretaker-login')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200"
            >
              Caretaker Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Your Health, Our Priority
            </div>
            <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Never Miss Your
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"> Medicine </span>
              Again
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Medi-Reminder helps patients track their medications, set reminders, and allows caretakers to monitor treatment progress — all in one simple platform.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setPage('patient-signup')}
                className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 rounded-2xl shadow-xl shadow-blue-200 transition-all duration-300 hover:scale-105"
              >
                Get Started — It's Free
              </button>
              <button
                onClick={() => setPage('caretaker-signup')}
                className="px-8 py-4 text-base font-bold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-2xl transition-all duration-300"
              >
                I'm a Caretaker
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">🏥</div>
                  <div>
                    <p className="font-bold text-gray-800">Today's Schedule</p>
                    <p className="text-sm text-gray-500">3 medicines pending</p>
                  </div>
                </div>
                {[
                  { name: 'Amoxicillin 500mg', time: '8:00 AM', status: '✅', color: 'bg-green-50 border-green-200' },
                  { name: 'Metformin 250mg', time: '2:00 PM', status: '⏰', color: 'bg-yellow-50 border-yellow-200' },
                  { name: 'Vitamin D3', time: '9:00 PM', status: '⏳', color: 'bg-blue-50 border-blue-200' },
                ].map((med, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${med.color} transition-all hover:scale-[1.02]`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{med.status}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{med.name}</p>
                        <p className="text-xs text-gray-500">{med.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">Daily</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-xl border border-blue-100 animate-bounce">
              <span className="text-2xl">💊</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-green-100">
              <span className="text-sm font-bold text-green-600">✓ 95% Adherence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Medi-Reminder?</h3>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to manage medications effectively</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📋', title: 'Medicine Tracking', desc: 'Add courses, medicines, schedules and track your doses with visual progress.' },
              { icon: '👨‍👩‍👦', title: 'Caretaker Access', desc: 'Parents or caretakers can monitor patient progress with read-only access.' },
              { icon: '📊', title: 'Progress Reports', desc: 'Visual pie charts showing completed vs remaining doses at a glance.' },
              { icon: '📸', title: 'Medicine Images', desc: 'Upload photos of your medicines for easy identification.' },
              { icon: '🩺', title: 'Doctor Appointments', desc: 'Track upcoming doctor visits alongside your medication schedule.' },
              { icon: '🔔', title: 'Smart Suggestions', desc: 'Get health tips and suggestions to improve your medication adherence.' },
            ].map((f, i) => (
              <div key={i} className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">Start Managing Your Health Today</h3>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">Join thousands of patients who never miss their medications with Medi-Reminder.</p>
            <button
              onClick={() => setPage('patient-signup')}
              className="px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold text-white">Medi-Reminder</span>
          </div>
          <p className="text-sm">Your trusted medication management companion</p>
          <p className="text-xs text-gray-600">© 2024 Medi-Reminder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
