import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { SearchProvider } from './contexts/SearchContext';
import Sidebar from './components/layout/Sidebar';
import MobileLayout from './components/layout/MobileLayout';
import PageLoadingOverlay from './components/common/PageLoadingOverlay';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { protectedRouteGroups } from './config/appRouteConfig';
import { useIsMobile } from './hooks/useIsMobile';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// ─── Desktop Layout ───────────────────────────────────────────────────────────

const AppLayout: React.FC = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F13B4B] focus:ring-offset-2"
      >
        Lompat ke konten utama
      </a>
      <Sidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className={`transition-all duration-300 outline-none min-h-screen ${
          isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingOverlay />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

// ─── Adaptive Layout ──────────────────────────────────────────────────────────
// Memilih MobileLayout atau AppLayout berdasarkan deteksi device.
// Semua route tetap sama, hanya shell yang berbeda.

const AdaptiveLayout: React.FC = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileLayout /> : <AppLayout />;
};

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <SearchProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AdaptiveLayout />}>
                    {protectedRouteGroups.map((group, groupIndex) => (
                      <Route
                        key={groupIndex}
                        element={<ProtectedRoute allowedRoles={group.allowedRoles} />}
                      >
                        {group.routes.map((r) => (
                          <Route key={r.path} path={r.path} element={r.element} />
                        ))}
                      </Route>
                    ))}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </SearchProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
