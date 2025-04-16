// src/pages/HomePage.jsx
import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import { AnimatedSection, fadeIn } from '@workspace/ui/components/ui/animated-section';
import { Section } from '@workspace/ui/components/ui/section';
import { LoadingFallback } from '@workspace/ui/components/ui/loading-fallback';

// Prefetch komponen besar saat aplikasi dimuat
const prefetchComponents = () => {
    import('../components/HeroSection');
    import('@workspace/ui/components/ui/auto-swipe-gallery');
    import('../components/CTOSection');
    import('../components/VerticalGridStream');
    import('../components/StatsSection');
};

// Lazy loading components dengan chunk name untuk better caching
const HeroSection = React.lazy(() => import(/* webpackChunkName: "HeroSection" */ '../components/HeroSection'));
const AutoSwipeGallery = React.lazy(() => import(/* webpackChunkName: "AutoSwipeGallery" */ '@workspace/ui/components/ui/auto-swipe-gallery'));
const CTOSection = React.lazy(() => import(/* webpackChunkName: "CTOSection" */ '../components/CTOSection'));
const VerticalGridStream = React.lazy(() => import(/* webpackChunkName: "VerticalGridStream" */ '../components/VerticalGridStream'));
const StatsSection = React.lazy(() => import(/* webpackChunkName: "StatsSection" */ '../components/StatsSection'));


const partnerLogos = [
    "https://logo.clearbit.com/bankmandiri.co.id",       // Bank Mandiri
    "https://logo.clearbit.com/telkomsel.com",           // Telkomsel
    "https://logo.clearbit.com/gojek.com",               // Gojek
    "https://logo.clearbit.com/tokopedia.com",           // Tokopedia
    "https://logo.clearbit.com/bukalapak.com",           // Bukalapak
    "https://logo.clearbit.com/indosatooredoo.com",      // Indosat Ooredoo
    "https://logo.clearbit.com/xl.co.id",                // XL Axiata
    "https://logo.clearbit.com/bca.co.id",               // Bank Central Asia (BCA)
    "https://logo.clearbit.com/bri.co.id",               // Bank Rakyat Indonesia (BRI)
    "https://logo.clearbit.com/traveloka.com",           // Traveloka
    "https://logo.clearbit.com/shopee.co.id",            // Shopee Indonesia
    "https://logo.clearbit.com/lazada.co.id",            // Lazada Indonesia
    "https://logo.clearbit.com/blibli.com",              // Blibli
    "https://logo.clearbit.com/pegadaian.co.id",         // Pegadaian
    "https://logo.clearbit.com/pertamina.com",           // Pertamina
    "https://logo.clearbit.com/indonesia.travel",        // Wonderful Indonesia
    "https://logo.clearbit.com/antam.com",               // ANTAM
    "https://logo.clearbit.com/garuda-indonesia.com",    // Garuda Indonesia
    "https://logo.clearbit.com/indomie.com",             // Indomie
    "https://logo.clearbit.com/gramedia.com",            // Gramedia
];

const newsItems = [
    {
        id: 1,
        title: "Peningkatan Teknologi Pertanian di Indonesia Timur",
        description: "Pemerintah meluncurkan program inovasi teknologi pertanian untuk meningkatkan hasil panen di wilayah Indonesia Timur.",
        imageUrl: "https://picsum.photos/id/117/500/300",
        date: "15 April 2025",
        category: "Teknologi",
        link: "/news/peningkatan-teknologi-pertanian"
    },
    {
        id: 2,
        title: "Strategi Baru Pengembangan Agribisnis Berkelanjutan",
        description: "Para ahli memperkenalkan strategi baru untuk mengembangkan sistem agribisnis yang berkelanjutan dan ramah lingkungan.",
        imageUrl: "https://picsum.photos/id/137/500/300",
        date: "12 April 2025",
        category: "Bisnis",
        link: "/news/strategi-agribisnis-berkelanjutan"
    },
    {
        id: 3,
        title: "Hasil Penelitian Bibit Unggul untuk Lahan Kering",
        description: "Tim peneliti berhasil mengembangkan bibit tanaman yang dapat tumbuh optimal di lahan kering dengan kebutuhan air minimal.",
        imageUrl: "https://picsum.photos/id/217/500/300",
        date: "10 April 2025",
        category: "Penelitian",
        link: "/news/penelitian-bibit-unggul"
    },
    {
        id: 4,
        title: "Workshop Petani Digital di 5 Kota Besar",
        description: "Seri workshop untuk memperkenalkan teknologi digital kepada petani akan diadakan di lima kota besar Indonesia.",
        imageUrl: "https://picsum.photos/id/108/500/300",
        date: "8 April 2025",
        category: "Acara",
        link: "/news/workshop-petani-digital"
    },
    {
        id: 5,
        title: "Kerja Sama Internasional untuk Ketahanan Pangan",
        description: "Indonesia menjalin kerja sama dengan negara-negara ASEAN untuk memperkuat program ketahanan pangan regional.",
        imageUrl: "https://picsum.photos/seed/picsum/500/300",
        date: "5 April 2025",
        category: "Internasional",
        link: "/news/kerjasama-ketahanan-pangan"
    },

];

// For Services Section
const serviceItems = [
    {
        id: 1,
        title: "Konsultasi Agribisnis",
        description: "Layanan konsultasi komprehensif untuk membantu Anda mengembangkan dan mengoptimalkan usaha pertanian.",
        link: "/services/konsultasi-agribisnis"
    },
    {
        id: 2,
        title: "Teknologi Smart Farming",
        description: "Implementasi teknologi IoT dan AI untuk meningkatkan efisiensi dan produktivitas pertanian Anda.",
        link: "/services/smart-farming"
    },
    {
        id: 3,
        title: "Manajemen Rantai Pasok",
        description: "Solusi end-to-end untuk mengoptimalkan rantai pasok dari pertanian hingga pasar.",
        link: "/services/manajemen-rantai-pasok"
    },
    {
        id: 4,
        title: "Pelatihan SDM Pertanian",
        description: "Program pelatihan untuk meningkatkan kapasitas sumber daya manusia di sektor pertanian.",
        link: "/services/pelatihan-sdm"
    }
];

function HomePage() {

    useEffect(() => {
        prefetchComponents();
    }, []);

    return (
        <>
            <Helmet>
                <title>Company Name - Your Trusted Business Partner</title>
                <meta name="description" content="Company Name provides top-quality services in [your industry]. Learn how we can help your business grow." />
                <meta name="keywords" content="company name, business, services, industry, solutions" />
                <link rel="canonical" href="https://yourcompany.com/" />
                <meta property="og:title" content="Company Name - Your Trusted Business Partner" />
                <meta property="og:description" content="Company Name provides top-quality services in [your industry]. Learn how we can help your business grow." />
                <meta property="og:url" content="https://yourcompany.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://yourcompany.com/images/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="overflow-x-hidden">
                <Suspense fallback={<LoadingFallback />}>
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <HeroSection
                            title="Empowering Agriculture Through Innovation"
                            subtitle="Kami menghadirkan solusi cerdas untuk meningkatkan produktivitas dan keberlanjutan usaha agrikultur Anda"
                            primaryBtnText="Mulai Sekarang"
                            primaryBtnLink="/contact"
                            secondaryBtnText="Layanan Kami"
                            secondaryBtnLink="/services"
                        />
                    </motion.div>

                    {/* Stats Section */}
                    <AnimatedSection>
                        <StatsSection />
                    </AnimatedSection>

                    {/* News Gallery */}
                    <AnimatedSection variants={fadeIn}>
                        <Section className="bg-gray-50">
                            <AutoSwipeGallery
                                items={newsItems}
                                title="Berita Terkini"
                                autoSwipeInterval={3000}
                                itemsToShow={4}
                                variant="news"
                            />
                        </Section>
                    </AnimatedSection>

                    {/* Partners Section */}
                    <AnimatedSection>
                        <Section>
                            <VerticalGridStream
                                images={partnerLogos}
                                title="Our Partners"
                                speed={15}
                                imageWidth={100}
                            />
                        </Section>
                    </AnimatedSection>

                    {/* Services Section */}
                    <AnimatedSection variants={fadeIn}>
                        <Section>
                            <AutoSwipeGallery
                                items={serviceItems}
                                title="Layanan Kami"
                                autoSwipeInterval={8000}
                                itemsToShow={3}
                                variant="services"
                                className="p-6 rounded-lg"
                            />
                        </Section>
                    </AnimatedSection>

                    {/* CTA Section */}
                    <AnimatedSection>
                        <CTOSection
                            title="Mari Tingkatkan Agrikultur Anda Bersama Kami"
                            description="Jadikan bisnis pertanian Anda lebih produktif dan berkelanjutan dengan solusi teknologi terdepan yang kami tawarkan."
                            btnText="Konsultasi Gratis"
                            btnLink="/contact"
                            secondaryBtnText="Lihat Layanan"
                            secondaryBtnLink="/services"
                        />
                    </AnimatedSection>
                </Suspense>
            </div>
        </>
    );
}

export default React.memo(HomePage);