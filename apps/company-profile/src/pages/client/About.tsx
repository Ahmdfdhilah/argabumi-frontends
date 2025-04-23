// src/pages/AboutPage.tsx
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';

import { AnimatedSection, fadeIn } from '@workspace/ui/components/ui/animated-section';
import { Section } from '@workspace/ui/components/ui/section';

// Mock data
import { teamMembers, milestones, partnerLogos } from '@/mocks/aboutData';
import Loader from '@workspace/ui/components/ui/loading';
import aboutImage from '@/assets/about.jpg';
import CTOSection from '@/components/client/CTOSection';

// Lazy loading components
const TeamSection = React.lazy(() => import(/* webpackChunkName: "TeamSection" */ '../../components/client/TeamSection'));
const MissionVisionSection = React.lazy(() => import(/* webpackChunkName: "MissionVisionSection" */ '../../components/client/MissionVision'));
const TimelineSection = React.lazy(() => import(/* webpackChunkName: "TimelineSection" */ '../../components/client/TimelineSection'));
const VerticalGridStream = React.lazy(() => import(/* webpackChunkName: "VerticalGridStream" */ '../../components/client/VerticalGridStream'));

function AboutPage() {
    return (
        <>
            <Helmet>
                <title>Tentang Kami - PT. Arga Bumi Indonesia</title>
                <meta name="description" content="Pelajari lebih lanjut tentang PT. Arga Bumi Indonesia, perusahaan inovatif dalam bidang agrikultur yang fokus pada pengembangan keberlanjutan dan mendukung petani lokal." />
                <meta name="keywords" content="PT. Arga Bumi Indonesia, agrikultur, pertanian berkelanjutan, petani lokal, komoditas pertanian, kopi" />
                <link rel="canonical" href="https://argabumi.id/tentang-kami" />
                <meta property="og:title" content="Tentang Kami - PT. Arga Bumi Indonesia" />
                <meta property="og:description" content="Pelajari lebih lanjut tentang PT. Arga Bumi Indonesia, perusahaan inovatif dalam bidang agrikultur yang fokus pada pengembangan keberlanjutan dan mendukung petani lokal." />
                <meta property="og:url" content="https://argabumi.id/tentang-kami" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://argabumi.id/images/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <div className="overflow-x-hidden mt-12">
                <Suspense fallback={<Loader text="Loading..." />}>
                    {/* Company Overview */}
                    <AnimatedSection>
                        <Section>
                            <div className="px-4 md:px-8 lg:px-16 grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl font-bold mb-6">Cerita Kami</h2>
                                    <p className="text-gray-700 mb-4">
                                        PT. Arga Bumi Indonesia didirikan pada tahun 2018 dengan visi untuk menciptakan ekosistem pertanian yang berkualitas dan berkelanjutan di Indonesia. Kami memulai perjalanan ini dengan fokus pada komoditas kopi, menjalin kerjasama langsung dengan petani lokal dari berbagai daerah di Indonesia.
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        Melalui pendekatan holistik yang menggabungkan teknologi, edukasi, dan pemberdayaan ekonomi, kami berupaya untuk meningkatkan kehidupan petani dan kualitas hasil pertanian secara bersamaan. Kami percaya bahwa kesuksesan bisnis kami tak terpisahkan dari kesejahteraan para petani mitra kami.
                                    </p>
                                    <p className="text-gray-700">
                                        Saat ini, PT. Arga Bumi Indonesia telah mengembangkan jejaring dengan lebih dari 27.000 petani kopi di seluruh nusantara, dengan fokus utama di Lampung, Sumatera Selatan, dan Bengkulu.
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={aboutImage}
                                            alt="Tim Arga Bumi Indonesia bekerja sama dengan petani lokal"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-accent rounded-lg -z-10"></div>
                                </div>
                            </div>
                        </Section>
                    </AnimatedSection>

                    {/* Mission, Vision and Values */}
                    <AnimatedSection variants={fadeIn}>
                        <MissionVisionSection
                            mission="Membangun ekosistem pertanian berkelanjutan yang meningkatkan kesejahteraan petani dan menghasilkan produk berkualitas premium untuk pasar domestik dan global."
                            vision="Menjadi perusahaan perkebunan berskala internasional yang berlandaskan skema koperasi dan prinsip pemberdayaan petani lokal."
                            values={[
                                {
                                    title: "Sehat",
                                    description: "Memastikan proses produksi yang bersih dan produk yang menyehatkan"
                                },
                                {
                                    title: "Cerdas",
                                    description: "Menerapkan inovasi dan teknologi dalam setiap aspek bisnis"
                                },
                                {
                                    title: "Berkualitas",
                                    description: "Menghasilkan produk premium yang konsisten dan terstandarisasi"
                                }
                            ]}
                        />
                    </AnimatedSection>

                    {/* Our Approach */}
                    <AnimatedSection variants={fadeIn}>
                        <Section className='px-4 md:px-8 lg:px-16'>
                            <h2 className="text-3xl font-bold mb-12 text-center">
                                <span className="inline-block mb-2">Langkah yang Kami Lakukan</span>
                                <div className="h-1 w-20 bg-green-500 mx-auto"></div>
                            </h2>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                                    <h3 className="text-xl font-bold mb-3">Pembinaan & Pendampingan</h3>
                                    <p className="text-gray-600">
                                        Melakukan pembinaan, pendampingan dan bantuan fasilitasi kebutuhan petani untuk meningkatkan kualitas dan produktivitas.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                                    <h3 className="text-xl font-bold mb-3">Standarisasi Produksi</h3>
                                    <p className="text-gray-600">
                                        Standarisasi dan fasilitasi perlakuan panen dan pasca panen kopi untuk menjamin konsistensi kualitas.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                                    <h3 className="text-xl font-bold mb-3">Timbal Balik Ekonomi</h3>
                                    <p className="text-gray-600">
                                        Memberikan timbal balik ekonomi kepada petani sebanding atas kontribusi mereka, memastikan kesejahteraan berkelanjutan.
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </AnimatedSection>

                    {/* Timeline / Milestones */}
                    <AnimatedSection>
                        <Section>
                            <TimelineSection
                                title="Perjalanan Kami"
                                milestones={milestones.map(m => ({ ...m, year: m.year.toString() }))}
                            />
                        </Section>
                    </AnimatedSection>

                    {/* Team Section */}
                    <AnimatedSection variants={fadeIn}>
                        <TeamSection
                            title="Tim Kami"
                            members={teamMembers}
                        />
                    </AnimatedSection>

                    {/* Partners Section */}
                    <AnimatedSection>
                        <Section>
                            <VerticalGridStream
                                images={partnerLogos}
                                title="Mitra Kerja Kami"
                                speed={15}
                                imageWidth={100}
                            />
                        </Section>
                    </AnimatedSection>

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

export default React.memo(AboutPage);