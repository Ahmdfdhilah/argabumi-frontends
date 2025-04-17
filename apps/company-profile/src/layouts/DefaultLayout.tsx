// src/layouts/DefaultLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { footerData } from '../mocks/footerData';

const Layout = () => {
    const location = useLocation();

    // Atur route mana yang ingin header-nya transparan
    const transparentRoutes = ['/'];
    const isHeaderTransparent = transparentRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col">
            <Header isTransparent={isHeaderTransparent} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer {...footerData} />
        </div>
    );
};

export default Layout;
