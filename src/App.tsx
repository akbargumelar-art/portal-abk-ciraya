import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';
import { SearchProvider } from './contexts/SearchContext';
import Sidebar from './components/layout/Sidebar';
import PageLoadingOverlay from './components/common/PageLoadingOverlay';

// Guards
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Lightweight Pages (immediate load)
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UnderConstructionPage from './pages/UnderConstructionPage';

// Lazy-loaded Pages (show loading overlay during page transitions)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const OutletRegisterPage = lazy(() => import('./pages/OutletRegisterPage'));
const StockPage = lazy(() => import('./pages/StockPage'));
const OmzetOutletPage = lazy(() => import('./pages/OmzetOutletPage'));
const SalesPlanPage = lazy(() => import('./pages/SalesPlanPage'));
const VisitFormPage = lazy(() => import('./pages/VisitFormPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const LinksPage = lazy(() => import('./pages/LinksPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const POPMonitoringPage = lazy(() => import('./pages/POPMonitoringPage'));
const SellThruPage = lazy(() => import('./pages/SellThruPage'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const KPIPage = lazy(() => import('./pages/KPIPage'));
const ProgramPage = lazy(() => import('./pages/ProgramPage'));
const FeePage = lazy(() => import('./pages/FeePage'));
const DataUploadPage = lazy(() => import('./pages/DataUploadPage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Sales Plan Pages (lazy)
const MonitoringVisitPage = lazy(() => import('./pages/sales-plan/MonitoringVisitPage'));
const PlanPerdanaPage = lazy(() => import('./pages/sales-plan/PlanPerdanaPage'));
const PlanVoucherPage = lazy(() => import('./pages/sales-plan/PlanVoucherPage'));
const PlanCVMPage = lazy(() => import('./pages/sales-plan/PlanCVMPage'));
const POPMaterialPage = lazy(() => import('./pages/sales-plan/POPMaterialPage'));

// Sell Thru Pages (lazy)
const STNotaPage = lazy(() => import('./pages/sell-thru/STNotaPage'));
const STDigiposPage = lazy(() => import('./pages/sell-thru/STDigiposPage'));
const PenjualanD2CPage = lazy(() => import('./pages/sell-thru/PenjualanD2CPage'));

// Performansi Pages (lazy)
const TopLinePage = lazy(() => import('./pages/performansi/TopLinePage'));
const FiveS4RPage = lazy(() => import('./pages/performansi/FiveS4RPage'));
const MarketSharePage = lazy(() => import('./pages/performansi/MarketSharePage'));
const AktifasiPage = lazy(() => import('./pages/performansi/AktifasiPage'));
const SelloutPage = lazy(() => import('./pages/performansi/SelloutPage'));
const InjectVoucherPage = lazy(() => import('./pages/performansi/InjectVoucherPage'));
const RedeemVoucherPage = lazy(() => import('./pages/performansi/RedeemVoucherPage'));

// KPI Pages (lazy)
const KPIClusterPage = lazy(() => import('./pages/kpi/KPIClusterPage'));
const KPISFPage = lazy(() => import('./pages/kpi/KPISFPage'));

// Fee Pages (lazy)
const ManagementFeePage = lazy(() => import('./pages/fee/ManagementFeePage'));
const MarketingFeePage = lazy(() => import('./pages/fee/MarketingFeePage'));
const GrossProfitPage = lazy(() => import('./pages/fee/GrossProfitPage'));

// DOA Pages (lazy)
const DOAAlokasiPage = lazy(() => import('./pages/doa/DOAAlokasiPage'));
const DOAListSNPage = lazy(() => import('./pages/doa/DOAListSNPage'));
const DOAStockPage = lazy(() => import('./pages/doa/DOAStockPage'));

// Dokumentasi Pages (lazy)
const DocumentsPage = lazy(() => import('./pages/dokumentasi/DocumentsPage'));
const VideoRoleplayPage = lazy(() => import('./pages/dokumentasi/VideoRoleplayPage'));

// Layout with Sidebar
const AppLayout: React.FC = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-200">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${isCollapsed ? 'ml-[72px]' : 'ml-64'}`}
      >
        <Suspense fallback={<PageLoadingOverlay />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

// Main App
function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <SearchProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Dashboard - All roles */}
                  <Route path="/dashboard" element={<DashboardPage />} />

                  {/* Reports - Admin and Manager only */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager']} />}>
                    <Route path="/reports" element={<ReportsPage />} />
                  </Route>

                  {/* Outlets - Most roles */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce']} />}>
                    <Route path="/outlets" element={<OutletRegisterPage />} />
                  </Route>

                  {/* Stock Pages */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce']} />}>
                    <Route path="/stock/perdana" element={<StockPage type="perdana" />} />
                    <Route path="/stock/voucher" element={<StockPage type="voucher" />} />
                  </Route>

                  {/* Omzet - Supervisors and above */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/omzet" element={<OmzetOutletPage />} />
                  </Route>

                  {/* Sales Plan - Supervisors and above (REMOVED Monitoring Visit) */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/sales-plan" element={<SalesPlanPage />} />
                    <Route path="/sales-plan/perdana" element={<PlanPerdanaPage />} />
                    <Route path="/sales-plan/voucher" element={<PlanVoucherPage />} />
                    <Route path="/sales-plan/cvm" element={<PlanCVMPage />} />
                    <Route path="/sales-plan/pop-material" element={<POPMaterialPage />} />
                  </Route>

                  {/* Sell Thru - Supervisors and above */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/sell-thru" element={<SellThruPage />} />
                    <Route path="/sell-thru/nota" element={<STNotaPage />} />
                    <Route path="/sell-thru/digipos" element={<STDigiposPage />} />
                    <Route path="/sell-thru/d2c" element={<PenjualanD2CPage />} />
                  </Route>

                  {/* Performance - Supervisors and above (REVAMPED) */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/performance" element={<PerformancePage />} />
                    <Route path="/performance/topline" element={<TopLinePage />} />
                    <Route path="/performance/5s4r" element={<FiveS4RPage />} />
                    <Route path="/performance/marketshare" element={<MarketSharePage />} />
                    <Route path="/performance/aktifasi" element={<AktifasiPage />} />
                    <Route path="/performance/sellout" element={<SelloutPage />} />
                    <Route path="/performance/inject-voucher" element={<InjectVoucherPage />} />
                    <Route path="/performance/redeem-voucher" element={<RedeemVoucherPage />} />
                  </Route>

                  {/* KPI - Admin and Manager only (REVAMPED) */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager']} />}>
                    <Route path="/kpi" element={<KPIPage />} />
                    <Route path="/kpi/cluster" element={<KPIClusterPage />} />
                    <Route path="/kpi/sf" element={<KPISFPage />} />
                  </Route>

                  {/* Visit Form - All field roles */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c', 'salesforce', 'direct_sales']} />}>
                    <Route path="/visit" element={<VisitFormPage />} />
                  </Route>

                  {/* Program - Supervisors and above */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/program" element={<ProgramPage />} />
                    <Route path="/program/scs" element={<UnderConstructionPage title="Program SCS" />} />
                    <Route path="/program/retina" element={<UnderConstructionPage title="Program Retina" />} />
                  </Route>

                  {/* Fee - Admin and Manager only (REVAMPED) */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager']} />}>
                    <Route path="/fee" element={<FeePage />} />
                    <Route path="/fee/management" element={<ManagementFeePage />} />
                    <Route path="/fee/marketing" element={<MarketingFeePage />} />
                    <Route path="/fee/gross-profit" element={<GrossProfitPage />} />
                  </Route>

                  {/* DOA - NEW MENU */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/doa/alokasi" element={<DOAAlokasiPage />} />
                    <Route path="/doa/list-sn" element={<DOAListSNPage />} />
                    <Route path="/doa/stock" element={<DOAStockPage />} />
                  </Route>

                  {/* Complaint - All roles */}
                  <Route path="/complaint" element={<ComplaintPage />} />

                  {/* POP Monitoring - Supervisors and above */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager', 'supervisor_ids', 'supervisor_d2c']} />}>
                    <Route path="/pop-monitoring" element={<POPMonitoringPage />} />
                  </Route>

                  {/* Data Upload - Admin and Manager only */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super', 'admin', 'manager']} />}>
                    <Route path="/data-upload" element={<DataUploadPage />} />
                    <Route path="/data-upload/sales" element={<UnderConstructionPage title="Upload Sales" />} />
                    <Route path="/data-upload/inventory" element={<UnderConstructionPage title="Upload Inventory" />} />
                  </Route>

                  {/* Documentation - All roles (REVAMPED) */}
                  <Route path="/docs" element={<DocumentationPage />} />
                  <Route path="/docs/visit" element={<MonitoringVisitPage />} />
                  <Route path="/docs/documents" element={<DocumentsPage />} />
                  <Route path="/docs/video" element={<VideoRoleplayPage />} />

                  {/* Links - All roles */}
                  <Route path="/links" element={<LinksPage />} />

                  {/* User Management - Admin only */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super']} />}>
                    <Route path="/users" element={<UserManagementPage />} />
                  </Route>

                  {/* Settings - Admin only */}
                  <Route element={<ProtectedRoute allowedRoles={['admin_super']} />}>
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SearchProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
