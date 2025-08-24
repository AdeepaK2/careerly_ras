'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import UndergradDashboard from '@/components/undergradSystem/UndergradDashboard';

export default function UndergradPage() {
  return (
    <ProtectedRoute>
      <UndergradDashboard />
    </ProtectedRoute>
  );
}
