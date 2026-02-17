import { useState } from 'react';
import type { Page, Patient, Caretaker } from './types';
import { LandingPage } from './components/LandingPage';
import { PatientAuth } from './components/PatientAuth';
import { CaretakerAuth } from './components/CaretakerAuth';
import { PatientDashboard } from './components/PatientDashboard';
import { CaretakerDashboard } from './components/CaretakerDashboard';

export function App() {
  const [page, setPage] = useState<Page>('landing');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [currentCaretaker, setCurrentCaretaker] = useState<Caretaker | null>(null);

  const handlePatientLogin = (patient: Patient) => {
    setCurrentPatient(patient);
    setPage('patient-dashboard');
  };

  const handleCaretakerLogin = (caretaker: Caretaker) => {
    setCurrentCaretaker(caretaker);
    setPage('caretaker-dashboard');
  };

  const handleLogout = () => {
    setCurrentPatient(null);
    setCurrentCaretaker(null);
  };

  switch (page) {
    case 'landing':
      return <LandingPage setPage={setPage} />;

    case 'patient-login':
      return <PatientAuth mode="login" setPage={setPage} onLogin={handlePatientLogin} />;

    case 'patient-signup':
      return <PatientAuth mode="signup" setPage={setPage} onLogin={handlePatientLogin} />;

    case 'patient-dashboard':
      if (!currentPatient) {
        setPage('patient-login');
        return null;
      }
      return <PatientDashboard patient={currentPatient} setPage={setPage} onLogout={handleLogout} />;

    case 'caretaker-login':
      return <CaretakerAuth mode="login" setPage={setPage} onLogin={handleCaretakerLogin} />;

    case 'caretaker-signup':
      return <CaretakerAuth mode="signup" setPage={setPage} onLogin={handleCaretakerLogin} />;

    case 'caretaker-dashboard':
      if (!currentCaretaker) {
        setPage('caretaker-login');
        return null;
      }
      return <CaretakerDashboard caretaker={currentCaretaker} setPage={setPage} onLogout={handleLogout} />;

    default:
      return <LandingPage setPage={setPage} />;
  }
}
