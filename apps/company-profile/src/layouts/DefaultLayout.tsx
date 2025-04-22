// src/layouts/DefaultLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';
import { footerData } from '../mocks/footerData';

const Layout = () => {
    const location = useLocation();

    // Atur route mana yang ingin header-nya transparan
    const transparentRoutes = ['/'];
    const isHeaderTransparent = transparentRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar isTransparent={isHeaderTransparent} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer {...footerData} />
        </div>
    );
};

export default Layout;
