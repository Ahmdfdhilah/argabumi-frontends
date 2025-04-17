// src/pages/HomePage.jsx
import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import { AnimatedSection, fadeIn } from '@workspace/ui/components/ui/animated-section';
import { Section } from '@workspace/ui/components/ui/section';
import { newsItems, partnerLogos, serviceItems } from '../mocks/homepageData';
import Loader from '@workspace/ui/components/ui/loading';

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
                <Suspense fallback={<Loader text="Loading..." />}>
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
                        <StatsSection className='relative z-10 -mt-4 md:-mt-8 lg:-mt-16'/>
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
                            title="Mari Bergabung Dalam Perjalanan Kami"
                            description="Jadilah bagian dari gerakan untuk memajukan pertanian Indonesia dan meningkatkan kesejahteraan petani lokal."
                            btnText="Hubungi Kami"
                            btnLink="/contact"
                            secondaryBtnText="Program Kemitraan"
                            secondaryBtnLink="/services"
                        />
                    </AnimatedSection>
                </Suspense>
            </div>
        </>
    );
}

export default React.memo(HomePage);