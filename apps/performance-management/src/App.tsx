import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard Routes */}
          <Route path="/" element={<PerformanceManagementHome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-profile" element={<UserDetailPage />} />

          {/* Performance Management Routes */}
          <Route path="/performance-management">
            <Route path="dashboard" element={<PerformanceManagementDashboard />} />

            {/* Company Management Routes */}
            <Route path="company-management">
              <Route path="departments" element={<DepartmentManagementPage />} />
              <Route path="teams" element={<TeamManagementPage />} />
              <Route path="employees" element={<EmployeeManagementPage />} />
            </Route>

            {/* BSC Routes */}
            <Route path="bsc">
              <Route path="dashboard" element={<BSCDashboard />} />
              <Route path="input" element={<BSCEntryPage />} />
            </Route>

            {/* IPM Routes */}
            <Route path="ipm">
              <Route index element={<IPMPage />} />
              <Route path=":employeeId/details" element={<EmployeeIPMDetailsPage />} />
            </Route>

            {/* MPM Routes */}
            <Route path="mpm">
              <Route path="target">
                <Route index element={<MPMTargetList />} />
                <Route path=":targetId" element={<MPMTargets />} />
                <Route path=":targetId/entri/:mpmId">
                  <Route path="teams" element={<MPMTargetsTeamKPI />} />
                  <Route path="teams/:teamId" element={<MPMTargetsActionPlans />} />
                </Route>
              </Route>

              <Route path="actual">
                <Route index element={<MPMActualList />} />
                <Route path=":mpmActualId" element={<MPMActuals />} />
                <Route path=":mpmActualId/entri/:mpmId">
                  <Route path="teams" element={<MPMActualsTeamKPI />} />
                  <Route path="teams/:teamId" element={<MPMActualsActionPlans />} />
                </Route>
              </Route>

              <Route path="dashboard" element={<MPMDashboard />} />
            </Route>

            <Route path="period-master" element={<PeriodMaster />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;