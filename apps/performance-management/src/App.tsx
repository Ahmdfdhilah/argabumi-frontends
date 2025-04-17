import { BrowserRouter, Route, Routes } from "react-router-dom";
import BSCDashboard from "./pages/BSCDashboard";
import BSCEntryPage from "./pages/BSCEntry";
import IPMPage from "./pages/IPM";
import PeriodMaster from "./pages/PeriodMaster";
import MPMTargets from "./pages/MPMTargets";
import PerformanceManagementDashboard from "./pages/PerformanceManagementDashboard";
import PerformanceManagementHome from "./pages/PerformanceManagementHome";
import UserDetailPage from "./pages/UserDetail";
import EmployeeIPMDetailsPage from "./pages/EmployeeIPMDetails";
import MPMTargetsTeamKPI from "./pages/MPMTargetsTeamKPI";
import MPMTargetsActionPlans from "./pages/MPMTargetsActionPlans";
import MPMActuals from "./pages/MPMActuals";
import MPMActualList from "./pages/MPMActualList";
import MPMTargetList from "./pages/MPMTargetsList";
import MPMActualsTeamKPI from "./pages/MPMActualsTeamKPI";
import MPMActualsActionPlans from "./pages/MPMActualsActionPlans";
import MPMDashboard from "./pages/MPMDashboard";
import EmployeeManagementPage from "./pages/EmployeeManagement";
import TeamManagementPage from "./pages/TeamManagement";
import DepartmentManagementPage from "./pages/DepartmentManagement";
import { Toaster } from "@workspace/ui/components/sonner";
import { PersistGate } from "redux-persist/integration/react";
import AuthGuard from "./components/AuthGuard";
import AuthProvider from "./components/AuthProvider";
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import Login from "./pages/Auth/Login";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Routes>
              {/* Dashboard Routes */}
              <Route path="/" element={<AuthGuard><PerformanceManagementHome /></AuthGuard>} />
              <Route path="/login" element={<Login />} />
              <Route path="/user-profile" element={<AuthGuard><UserDetailPage /></AuthGuard>} />

              {/* Performance Management Routes */}
              <Route path="/performance-management">
                <Route path="dashboard" element={<AuthGuard><PerformanceManagementDashboard /></AuthGuard>} />

                {/* Company Management Routes */}
                <Route path="company-management">
                  <Route path="departments" element={<AuthGuard><DepartmentManagementPage /></AuthGuard>} />
                  <Route path="teams" element={<AuthGuard><TeamManagementPage /></AuthGuard>} />
                  <Route path="employees" element={<AuthGuard><EmployeeManagementPage /></AuthGuard>} />
                </Route>

                {/* BSC Routes */}
                <Route path="bsc">
                  <Route path="dashboard" element={<AuthGuard><BSCDashboard /></AuthGuard>} />
                  <Route path="input" element={<AuthGuard><BSCEntryPage /></AuthGuard>} />
                </Route>

                {/* IPM Routes */}
                <Route path="ipm">
                  <Route index element={<AuthGuard><IPMPage /></AuthGuard>} />
                  <Route path=":employeeId/details" element={<AuthGuard><EmployeeIPMDetailsPage /></AuthGuard>} />
                </Route>

                {/* MPM Routes */}
                <Route path="mpm">
                  <Route path="target">
                    <Route index element={<AuthGuard><MPMTargetList /></AuthGuard>} />
                    <Route path=":targetId" element={<AuthGuard><MPMTargets /></AuthGuard>} />
                    <Route path=":targetId/entri/:mpmId">
                      <Route path="teams" element={<AuthGuard><MPMTargetsTeamKPI /></AuthGuard>} />
                      <Route path="teams/:teamId" element={<AuthGuard><MPMTargetsActionPlans /></AuthGuard>} />
                    </Route>
                  </Route>

                  <Route path="actual">
                    <Route index element={<AuthGuard><MPMActualList /></AuthGuard>} />
                    <Route path=":mpmActualId" element={<AuthGuard><MPMActuals /></AuthGuard>} />
                    <Route path=":mpmActualId/entri/:mpmId">
                      <Route path="teams" element={<AuthGuard><MPMActualsTeamKPI /></AuthGuard>} />
                      <Route path="teams/:teamId" element={<AuthGuard><MPMActualsActionPlans /></AuthGuard>} />
                    </Route>
                  </Route>

                  <Route path="dashboard" element={<AuthGuard><MPMDashboard /></AuthGuard>} />
                </Route>

                <Route path="period-master" element={<AuthGuard><PeriodMaster /></AuthGuard>} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;