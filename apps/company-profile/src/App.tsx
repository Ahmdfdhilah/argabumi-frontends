// src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import your layouts/components
import Layout from './layouts/DefaultLayout';
import Loader from '@workspace/ui/components/ui/loading';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import AuthProvider from './components/auth/AuthProvider';
import { Toaster } from "@workspace/ui/components/sonner";
import AuthGuard from './components/auth/AuthGuard';
import AdminLayout from './layouts/AdminLayout';

// Lazy load pages for better performance

//client
const ClientHomePage = React.lazy(() => import('./pages/client/Homepage'));
const ClientNewsListPage = React.lazy(() => import('./pages/client/NewsListPage'));
const ClientNewsDetailPage = React.lazy(() => import('./pages/client/NewsDetailPage'));
const ClientAboutPage = React.lazy(() => import('./pages/client/About'));

//admin
const AdminNewsListPage = React.lazy(() => import('./pages/admin/News/NewsListPage'));
const AdminNewsFormPage = React.lazy(() => import('./pages/admin/News/NewsFormPage'));
const AdminNewsDetailsPage = React.lazy(() => import('./pages/admin/News/NewsDetailsPage'));
const AdminNewsCategoryListPage = React.lazy(() => import('./pages/admin/NewsCategory/NewsCategoryList'));
const AdminNewsCategoryFormPage = React.lazy(() => import('./pages/admin/NewsCategory/NewsCategoryForm'));
const AdminNewsTagListPage = React.lazy(() => import('./pages/admin/NewsTags/NewsTagsList'));
const AdminNewsTagFormPage = React.lazy(() => import('./pages/admin/NewsTags/NewsTagsForm'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/Dashboard'));
function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Routes with layout */}
                  <Route index element={
                    <Suspense fallback={<Loader text="Loading..." />}>
                      <ClientHomePage />
                    </Suspense>
                  } />
                  <Route path="about" element={
                    <Suspense fallback={<Loader text="Loading..." />}>
                      <ClientAboutPage />
                    </Suspense>
                  } />
                  <Route path="news" element={
                    <Suspense fallback={<Loader text="Loading..." />}>
                      <ClientNewsListPage />
                    </Suspense>
                  } />
                  <Route path="news/:id" element={
                    <Suspense fallback={<Loader text="Loading..." />}>
                      <ClientNewsDetailPage />
                    </Suspense>
                  } />
                </Route>

                {/* Admin routes */}
                <Route element={<AuthGuard requireAdmin={true} />}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="news">
                      <Route index element={<AdminNewsListPage />} />
                      <Route path="create" element={<AdminNewsFormPage />} />
                      <Route path="edit/:newsId" element={<AdminNewsFormPage />} />
                      <Route path="details/:newsId" element={<AdminNewsDetailsPage />} />
                      <Route path="categories" element={<AdminNewsCategoryListPage />} />
                      <Route path="categories/create" element={<AdminNewsCategoryFormPage />} />
                      <Route path="categories/edit/:categoryId" element={<AdminNewsCategoryFormPage />} />
                      <Route path="tags" element={<AdminNewsTagListPage />} />
                      <Route path="tags/create" element={<AdminNewsTagFormPage />} />
                      <Route path="tags/edit/:tagId" element={<AdminNewsTagFormPage />} />
                    </Route>

                    {/* <Route path="tags">
                    <Route path="list" element={<TagListPage />} />
                    <Route path="create" element={<TagCreatePage />} />
                    <Route path="edit/:id" element={<TagEditPage />} />
                  </Route>  */}
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  );
}

export default App;