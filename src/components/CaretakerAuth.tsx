import { useState } from 'react';
import type { Page, Caretaker } from '../types';

interface CaretakerAuthProps {
  mode: 'login' | 'signup';
  setPage: (page: Page) => void;
  onLogin: (caretaker: Caretaker) => void;
}

export function CaretakerAuth({ mode, setPage, onLogin }: CaretakerAuthProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name || !mobile || !email || !password || !patientEmail) {
        setError('Please fill in all fields');
        return;
      }
      const patients = JSON.parse(localStorage.getItem('medi_patients') || '[]');
      if (!patients.find((p: { email: string }) => p.email === patientEmail.toLowerCase())) {
        setError('No patient found with this email. Patient must register first.');
        return;
      }
      const caretaker: Caretaker = {
        id: Date.now().toString(),
        name,
        mobile,
        email: email.toLowerCase(),
        password,
        patientEmail: patientEmail.toLowerCase(),
      };
      const caretakers: Caretaker[] = JSON.parse(localStorage.getItem('medi_caretakers') || '[]');
      if (caretakers.find(c => c.email === caretaker.email)) {
        setError('An account with this email already exists');
        return;
      }
      caretakers.push(caretaker);
      localStorage.setItem('medi_caretakers', JSON.stringify(caretakers));
      onLogin(caretaker);
    } else {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
      const caretakers: Caretaker[] = JSON.parse(localStorage.getItem('medi_caretakers') || '[]');
      const caretaker = caretakers.find(c => c.email === email.toLowerCase() && c.password === password);
      if (!caretaker) {
        setError('Invalid email or password');
        return;
      }
      onLogin(caretaker);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => setPage('landing')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-3xl">👨‍👩‍👦</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signup' ? 'Caretaker Registration' : 'Caretaker Login'}
            </h2>
            <p className="text-purple-100 text-sm mt-2">
              {mode === 'signup' ? 'Register to monitor your patient' : 'Sign in to view patient reports'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="Your mobile number"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient's Email</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔗</span>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={e => setPatientEmail(e.target.value)}
                      placeholder="Patient's registered email"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="caretaker@example.com"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setPage('caretaker-login')} className="text-purple-600 font-semibold hover:underline">
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setPage('caretaker-signup')} className="text-purple-600 font-semibold hover:underline">
                    Register Now
                  </button>
                </>
              )}
            </p>

            <div className="bg-purple-50 rounded-xl p-4 text-xs text-purple-600">
              <p className="font-semibold mb-1">ℹ️ Note for Caretakers:</p>
              <p>You will have read-only access to monitor the patient's medication progress. You cannot edit or delete any patient data.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
