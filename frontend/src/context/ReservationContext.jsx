import { createContext, useContext, useState } from 'react';

const ReservationContext = createContext(null);

// These IDs must match what LoginPage sets on login
export const THERAPIST_DEMO_ID = 'therapist-demo-1';
export const PATIENT_DEMO_ID   = 'patient-demo-1';

// Seed data — one request per status so both views show useful data
const initialRequests = [
  {
    id: 'req-001',
    clientName: 'Amina B.',
    clientId: PATIENT_DEMO_ID,       // seen by the logged-in demo patient
    therapistId: THERAPIST_DEMO_ID,  // seen by the logged-in demo therapist
    therapistName: 'Dr. Salma Benkirane',
    service: 'Consultation individuelle',
    mode: 'online',
    date: 'Lun-24',
    time: '10:00',
    reason: 'anxiete',
    notes: "Animation importante cette semaine, j'ai besoin d'aide pour gérer mon stress.",
    status: 'pending',
    createdAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'req-002',
    clientName: 'Yassir M.',
    clientId: 'other-client-1',      // another patient — therapist sees it, demo patient does not
    therapistId: THERAPIST_DEMO_ID,
    therapistName: 'Dr. Salma Benkirane',
    service: 'Consultation initiale',
    mode: 'online',
    date: 'Mar-25',
    time: '14:00',
    reason: 'depression',
    notes: '',
    status: 'accepted',
    createdAt: '2026-03-14T09:00:00Z',
  },
  {
    id: 'req-003',
    clientName: 'Nora K.',
    clientId: 'other-client-2',
    therapistId: THERAPIST_DEMO_ID,
    therapistName: 'Dr. Salma Benkirane',
    service: 'Thérapie de couple',
    mode: 'cabinet',
    date: 'Mer-26',
    time: '11:00',
    reason: 'couple',
    notes: '',
    status: 'rejected',
    createdAt: '2026-03-13T14:00:00Z',
  },
];

export function ReservationProvider({ children }) {
  const [requests, setRequests] = useState(initialRequests);

  const addRequest = (req) => {
    setRequests(prev => [
      {
        ...req,
        id: `req-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const updateStatus = (id, status) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    );
  };

  // Therapist: all requests addressed to them
  const getRequestsForTherapist = (therapistId) =>
    requests.filter(r => r.therapistId === therapistId);

  // Patient: only their own requests
  const getRequestsForClient = (clientId) =>
    requests.filter(r => r.clientId === clientId);

  // How many pending requests a therapist has (navbar badge)
  const pendingCount = (therapistId) =>
    requests.filter(r => r.therapistId === therapistId && r.status === 'pending').length;

  return (
    <ReservationContext.Provider
      value={{ requests, addRequest, updateStatus, getRequestsForTherapist, getRequestsForClient, pendingCount }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservations must be used inside ReservationProvider');
  return ctx;
}
