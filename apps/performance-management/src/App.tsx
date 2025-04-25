import { BrowserRouter, Route, Routes } from "react-router-dom";
import BSCDashboard from "./pages/BSC/BSCDashboard";
import BSCEntryPage from "./pages/BSC/BSCEntry";
import Targets from "./pages/MPM/Targets";
import PerformanceManagementDashboard from "./pages/PerformanceManagementDashboard";
import PerformanceManagementHome from "./pages/PerformanceManagementHome";
import UserDetailPage from "./pages/UserDetail";
import Actuals from "./pages/MPM/Actuals";
import MPMActualList from "./pages/MPM/MPMActualList";
import MPMTargetList from "./pages/MPM/MPMTargetsList";
import MPMActualsActionPlans from "./pages/MPM/_";
import MPMDashboard from "./pages/MPM/MPMDashboard";
import { Toaster } from "@workspace/ui/components/sonner";
import { PersistGate } from "redux-persist/integration/react";
import AuthGuard from "./components/AuthGuard";
import AuthProvider from "./components/AuthProvider";
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import Login from "./pages/Auth/Login";
import OrganizationUnitsPage from "./pages/OrganizationUnit/OrganizationUnitList";
import OrganizationHierarchyPage from "./pages/OrganizationUnit/OrganizationHierarchyPage";
import OrganizationUnitFormPage from "./pages/OrganizationUnit/OrganizationUnitFormPage";
import OrganizationUnitDetailsPage from "./pages/OrganizationUnit/OrganizationDetailsPage";
import EmployeeManagementPage from "./pages/Employee/EmployeesPage";
import EmployeeForm from "./pages/Employee/EmployeeForm";
import EmployeeDetailsPage from "./pages/Employee/EmployeeDetailsPage";
import EmployeeHierarchyPage from "./pages/Employee/EmployeeHierarchyPage";
import PeriodMasterPage from "./pages/Periods/PeriodMasterPage";
import PeriodFormPage from "./pages/Periods/PeriodFormPage";
import MPMTargetActionPlan from "./pages/MPM/MPMTargetActionPlan";
import RoleManagementPage from "./pages/Roles/RoleManagement";
import IPMTargetList from "./pages/IPM/IPMTargetList";
import IPMActualList from "./pages/IPM/IPMActualList";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Routes>
              {/* Dashboard Routes */}
              <Route path="/" element={<PerformanceManagementHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user-profile" element={<AuthGuard><UserDetailPage /></AuthGuard>} />

              {/* Performance Management Routes */}
              <Route path="/performance-management">
                <Route path="dashboard" element={<AuthGuard><PerformanceManagementDashboard /></AuthGuard>} />

                {/* Organization Units Routes */}
                <Route path="organization-units">
                  <Route index element={<AuthGuard><OrganizationUnitsPage /></AuthGuard>} />
                  <Route path="hierarchy" element={<AuthGuard><OrganizationHierarchyPage /></AuthGuard>} />
                  <Route path=":id/edit" element={<AuthGuard><OrganizationUnitFormPage /></AuthGuard>} />
                  <Route path="add" element={<AuthGuard><OrganizationUnitFormPage /></AuthGuard>} />
                  <Route path=":id/details" element={<AuthGuard><OrganizationUnitDetailsPage /></AuthGuard>} />
                </Route>

                {/* Employee Management Routes */}
                <Route path="employees">
                  <Route index element={<AuthGuard><EmployeeManagementPage /></AuthGuard>} />
                  <Route path=":id/details" element={<AuthGuard><EmployeeDetailsPage /></AuthGuard>} />
                  <Route path=":id/edit" element={<AuthGuard><EmployeeForm /></AuthGuard>} />
                  <Route path="add" element={<AuthGuard><EmployeeForm /></AuthGuard>} />
                  <Route path=":id/hierarchy" element={<AuthGuard><EmployeeHierarchyPage /></AuthGuard>} />
                </Route>

                {/* Role Management Routes */}
                <Route path="roles">
                  <Route index element={<AuthGuard><RoleManagementPage /></AuthGuard>} />
                </Route>

                {/* BSC Routes */}
                <Route path="bsc">
                  <Route path="dashboard" element={<AuthGuard><BSCDashboard /></AuthGuard>} />
                  <Route path="input" element={<AuthGuard><BSCEntryPage /></AuthGuard>} />
                </Route>

                {/* IPM Routes */}
                <Route path="ipm">

                  <Route path="target">
                    <Route index element={<AuthGuard><IPMTargetList /></AuthGuard>} />
                    <Route path=":submissionId" element={<AuthGuard><Targets submissionTypePic="IPM" /></AuthGuard>} />
                  </Route>

                  <Route path="actual">
                    <Route index element={<AuthGuard><IPMActualList /></AuthGuard>} />
                    <Route path=":submissionId" element={<AuthGuard><Actuals submissionTypePic="IPM" /></AuthGuard>} />
                  </Route>
                </Route>
                
                {/* MPM Routes */}
                <Route path="mpm">
                  <Route path="target">
                    <Route index element={<AuthGuard><MPMTargetList /></AuthGuard>} />
                    <Route path=":submissionId" element={<AuthGuard><Targets submissionTypePic="MPM" /></AuthGuard>} />
                    <Route path=":submissionId/kpi/:kpiId">
                      <Route path="action-plans" element={<AuthGuard><MPMTargetActionPlan /></AuthGuard>} />
                      {/* <Route path="teams/:teamId" element={<AuthGuard><MPMTargetsActionPlans /></AuthGuard>} /> */}
                    </Route>
                  </Route>

                  <Route path="actual">
                    <Route index element={<AuthGuard><MPMActualList /></AuthGuard>} />
                    <Route path=":submissionId" element={<AuthGuard><Actuals submissionTypePic="MPM" /></AuthGuard>} />
                    <Route path=":submissionId/kpi/:kpiId">
                      <Route path="action-plans" element={<AuthGuard><MPMActualsActionPlans /></AuthGuard>} />
                    </Route>
                  </Route>

                  <Route path="dashboard" element={<AuthGuard><MPMDashboard /></AuthGuard>} />
                </Route>
                <Route path="periods">
                  <Route index element={<AuthGuard><PeriodMasterPage /></AuthGuard>} />
                  <Route path="add" element={<AuthGuard><PeriodFormPage /></AuthGuard>} />
                  <Route path=":id/edit" element={<AuthGuard><PeriodFormPage /></AuthGuard>} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;