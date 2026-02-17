import { useState } from 'react';
import type { Page, Patient } from '../types';

interface PatientAuthProps {
  mode: 'login' | 'signup';
  setPage: (page: Page) => void;
  onLogin: (patient: Patient) => void;
}

export function PatientAuth({ mode, setPage, onLogin }: PatientAuthProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name || !mobile || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (mobile.length < 10) {
        setError('Please enter a valid mobile number');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      const patient: Patient = {
        id: Date.now().toString(),
        name,
        mobile,
        email: email.toLowerCase(),
        password,
      };
      const patients: Patient[] = JSON.parse(localStorage.getItem('medi_patients') || '[]');
      if (patients.find(p => p.email === patient.email)) {
        setError('An account with this email already exists');
        return;
      }
      patients.push(patient);
      localStorage.setItem('medi_patients', JSON.stringify(patients));
      onLogin(patient);
    } else {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
      const patients: Patient[] = JSON.parse(localStorage.getItem('medi_patients') || '[]');
      const patient = patients.find(p => p.email === email.toLowerCase() && p.password === password);
      if (!patient) {
        setError('Invalid email or password');
        return;
      }
      onLogin(patient);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => setPage('landing')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-3xl">🧑‍⚕️</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signup' ? 'Patient Registration' : 'Patient Login'}
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              {mode === 'signup' ? 'Create your account to start tracking' : 'Welcome back! Sign in to continue'}
            </p>
          </div>

          {/* Form */}
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
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
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
                      placeholder="Enter mobile number"
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
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
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm"
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
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button type="button" onClick={() => setPage('patient-login')} className="text-blue-600 font-semibold hover:underline">
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setPage('patient-signup')} className="text-blue-600 font-semibold hover:underline">
                    Register Now
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
