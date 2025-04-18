// src/pages/HomePage.jsx
import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

import { AnimatedSection, slideInBottom, slideInLeft, slideInRight } from '@workspace/ui/components/ui/animated-section';
import { Section } from '@workspace/ui/components/ui/section';
import { newsItems, partnerLogos, serviceItems } from '../mocks/homepageData';
import Loader from '@workspace/ui/components/ui/loading';
import { testimonialsData } from '../mocks/aboutData';
// Prefetch komponen besar saat aplikasi dimuat
const prefetchComponents = () => {
    import('../components/HeroSection');
    import('@workspace/ui/components/ui/auto-swipe-gallery');
    import('../components/CTOSection');
    import('../components/VerticalGridStream');
    import('../components/StatsSection');
    import('../components/TestimonialSection');
    import('../components/ProcessWorkflow');
};

// Lazy loading components dengan chunk name untuk better caching
const HeroSection = React.lazy(() => import(/* webpackChunkName: "HeroSection" */ '../components/HeroSection'));
const AutoSwipeGallery = React.lazy(() => import(/* webpackChunkName: "AutoSwipeGallery" */ '@workspace/ui/components/ui/auto-swipe-gallery'));
const CTOSection = React.lazy(() => import(/* webpackChunkName: "CTOSection" */ '../components/CTOSection'));
const VerticalGridStream = React.lazy(() => import(/* webpackChunkName: "VerticalGridStream" */ '../components/VerticalGridStream'));
const StatsSection = React.lazy(() => import(/* webpackChunkName: "StatsSection" */ '../components/StatsSection'));
const TestimonialsSection = React.lazy(() => import(/* webpackChunkName: "TestimonialsSection" */ '../components/TestimonialSection'));
const ProcessWorkflow = React.lazy(() => import(/* webpackChunkName: "ProcessWorkflow" */ '../components/ProcessWorkflow'));
function HomePage() {

    useEffect(() => {
        prefetchComponents();
    }, []);

    return (
        <>
            <Helmet>
                <title>Arga Bumi Indonesia - Solusi Cerdas untuk Agrikultur Kopi</title>
                <meta name="description" content="Arga Bumi Indonesia adalah perusahaan pengelolaan dan pemasaran hasil bumi terutama kopi, berkomitmen untuk meningkatkan perekonomian petani kopi melalui sistem yang efektif." />
                <meta name="keywords" content="Arga Bumi Indonesia, kopi, agrikultur, pertanian kopi, green bean, petani kopi, pemasaran kopi, hasil bumi Indonesia" />
                <link rel="canonical" href="https://argabumiindonesia.com/" />
                <meta property="og:title" content="Arga Bumi Indonesia - Solusi Cerdas untuk Agrikultur Kopi" />
                <meta property="og:description" content="Perusahaan pemeliharaan, pengelolaan dan pemasaran hasil bumi kopi dengan visi menjadi perusahaan perkebunan berskala internasional berlandaskan skema koperasi." />
                <meta property="og:url" content="https://argabumiindonesia.com/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://argabumiindonesia.com/images/og-image.jpg" />
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
                    <AnimatedSection
                        variants={slideInBottom}
                        triggerOnce={false}
                        delay={0.4}
                    >
                        <StatsSection className='relative z-10 -mt-12 md:-mt-16 lg:-mt-24' />
                    </AnimatedSection>

                    {/* News Gallery */}
                    <AnimatedSection
                        variants={slideInRight}
                        triggerOnce={false}
                        delay={0.9}>
                        <Section>
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
                    <AnimatedSection
                        variants={slideInRight}
                        triggerOnce={false}
                        delay={0.9}>
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
                    <AnimatedSection variants={slideInLeft}
                        triggerOnce={false}
                        delay={0.9}>
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

                    {/* Testimonials Section */}
                    <AnimatedSection variants={slideInRight}
                        triggerOnce={false}
                        delay={0.9}>
                        <TestimonialsSection
                            testimonials={testimonialsData}
                            title="Kata Mereka"
                        />
                    </AnimatedSection>

                    {/* Process Workflow */}
                    <ProcessWorkflow />

                    {/* CTA Section */}
                    <CTOSection
                        title="Mari Bergabung Dalam Perjalanan Kami"
                        description="Jadilah bagian dari gerakan untuk memajukan pertanian Indonesia dan meningkatkan kesejahteraan petani lokal."
                        btnText="Hubungi Kami"
                        btnLink="/contact"
                        secondaryBtnText="Program Kemitraan"
                        secondaryBtnLink="/services"
                    />


                </Suspense>
            </div>
        </>
    );
}

export default React.memo(HomePage);