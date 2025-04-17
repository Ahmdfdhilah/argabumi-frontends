// src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Import your layouts/components
import Layout from './layouts/DefaultLayout';
import Loader from '@workspace/ui/components/ui/loading';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/Homepage'));
const NewsListPage = React.lazy(() => import('./pages/NewsListPage'));
const NewsDetailPage = React.lazy(() => import('./pages/NewsDetailPage'));
const AboutPage = React.lazy(() => import('./pages/About'));
function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Routes with layout */}
            <Route index element={
              <Suspense fallback={<Loader text="Loading..." />}>
                <HomePage />
              </Suspense>
            } />
            <Route path="about" element={
              <Suspense fallback={<Loader text="Loading..." />}>
                <AboutPage />
              </Suspense>
            } />
            <Route path="news" element={
              <Suspense fallback={<Loader text="Loading..." />}>
                <NewsListPage />
              </Suspense>
            } />
            <Route path="news/:id" element={
              <Suspense fallback={<Loader text="Loading..." />}>
                <NewsDetailPage />
              </Suspense>
            } />
            {/* Add more routes as needed */}
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;