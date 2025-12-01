import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Pipeline } from '@/pages/Pipeline';
import { People } from '@/pages/People';
import { CheckIn } from '@/pages/CheckIn';
import { Groups } from '@/pages/Groups';
import { Workflows } from '@/pages/Workflows';
import { Ministries } from '@/pages/Ministries';
import { Tasks } from '@/pages/Tasks';
import { Reports } from '@/pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Dashboard />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Pipeline />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people"
            element={
              <ProtectedRoute>
                <AppShell>
                  <People />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Tasks />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkin"
            element={
              <ProtectedRoute>
                <AppShell>
                  <CheckIn />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Groups />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Workflows />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ministries"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Ministries />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Reports />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
