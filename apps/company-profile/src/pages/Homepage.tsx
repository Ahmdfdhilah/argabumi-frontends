// src/pages/HomePage.jsx
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/HeroSection';
import AutoSwipeGallery, { GalleryItem } from '@workspace/ui/components/ui/auto-swipe-gallery';
import CTOSection from '../components/CTOSection';
import VerticalGridStream from '../components/VerticalGridStream';
import StatsSection from '../components/StatsSection';

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


const newsItems: GalleryItem[] = [
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
    }
];

// For Services Section
const serviceItems: GalleryItem[] = [
    {
        id: 1,
        title: "Konsultasi Agribisnis",
        description: "Layanan konsultasi komprehensif untuk membantu Anda mengembangkan dan mengoptimalkan usaha pertanian.",
        //   imageUrl: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80",
        link: "/services/konsultasi-agribisnis"
    },
    {
        id: 2,
        title: "Teknologi Smart Farming",
        description: "Implementasi teknologi IoT dan AI untuk meningkatkan efisiensi dan produktivitas pertanian Anda.",
        //   imageUrl: "https://images.unsplash.com/photo-1602524814707-6225c33b6f65?auto=format&fit=crop&w=800&q=80",
        link: "/services/smart-farming"
    },
    {
        id: 3,
        title: "Manajemen Rantai Pasok",
        description: "Solusi end-to-end untuk mengoptimalkan rantai pasok dari pertanian hingga pasar.",
        //   imageUrl: "https://images.unsplash.com/photo-1581090700227-1e8c6e5cbd1b?auto=format&fit=crop&w=800&q=80",
        link: "/services/manajemen-rantai-pasok"
    },
    {
        id: 4,
        title: "Pelatihan SDM Pertanian",
        description: "Program pelatihan untuk meningkatkan kapasitas sumber daya manusia di sektor pertanian.",
        //   imageUrl: "https://images.unsplash.com/photo-1610057090576-d3e13d513252?auto=format&fit=crop&w=800&q=80",
        link: "/services/pelatihan-sdm"
    }
];


function HomePage() {
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
                <HeroSection
                    title="Empowering Agriculture Through Innovation"
                    subtitle="Kami menghadirkan solusi cerdas untuk meningkatkan produktivitas dan keberlanjutan usaha agrikultur Anda"
                    primaryBtnText="Mulai Sekarang"
                    primaryBtnLink="/contact"
                    secondaryBtnText="Layanan Kami"
                    secondaryBtnLink="/services"
                />

                <StatsSection />

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        {/* News Gallery */}
                        <AutoSwipeGallery
                            items={newsItems}
                            title="Berita Terkini"
                            autoSwipeInterval={6000}
                            itemsToShow={3}
                            variant="news"
                        />
                    </div>
                </section>

                {/* Partners section with SeamlessStream */}
                <section className="bg-white">
                    <div className="container mx-auto px-4">
                        <VerticalGridStream
                            images={partnerLogos}
                            title="Our Partners"
                            description="Working with the best in the industry"
                            columns={3}
                            speed={15}
                        />
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        {/* Services Gallery */}
                        <AutoSwipeGallery
                            items={serviceItems}
                            title="Layanan Kami"
                            autoSwipeInterval={8000}
                            itemsToShow={3}
                            variant="services"
                            className="p-6 rounded-lg"
                        />
                    </div>
                </section>

                <CTOSection
                    title="Mari Tingkatkan Agrikultur Anda Bersama Kami"
                    description="Jadikan bisnis pertanian Anda lebih produktif dan berkelanjutan dengan solusi teknologi terdepan yang kami tawarkan."
                    btnText="Konsultasi Gratis"
                    btnLink="/contact"
                    secondaryBtnText="Lihat Layanan"
                    secondaryBtnLink="/services"
                />
            </div>
        </>
    );
}

export default HomePage;