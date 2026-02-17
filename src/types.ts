export interface Patient {
  id: string;
  name: string;
  mobile: string;
  email: string;
  password: string;
}

export interface Medicine {
  id: string;
  patientId: string;
  courseName: string;
  medicineName: string;
  startDate: string;
  time: string;
  totalDays: number;
  completedDoses: number;
  imageUrl: string;
  doctorAppointment: string;
  notes: string;
  doseLog: DoseLogEntry[];
}

export interface DoseLogEntry {
  date: string;
  taken: boolean;
}

export interface Caretaker {
  id: string;
  name: string;
  mobile: string;
  email: string;
  password: string;
  patientEmail: string;
}

export type Page =
  | 'landing'
  | 'patient-login'
  | 'patient-signup'
  | 'patient-dashboard'
  | 'caretaker-login'
  | 'caretaker-signup'
  | 'caretaker-dashboard';
