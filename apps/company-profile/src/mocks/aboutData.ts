import { CheckCircle, Handshake, MapPinned, Sprout } from "lucide-react";

// src/mocks/aboutData.js
export const teamMembers = [
    {
        id: 1,
        name: "Budi Santoso",
        position: "Chief Executive Officer",
        image: "https://placehold.co/400",
        bio: "Berpengalaman lebih dari 15 tahun dalam industri agrikultur dan perkebunan kopi."
    },
    {
        id: 2,
        name: "Dewi Lestari",
        position: "Chief Operations Officer",
        image: "https://placehold.co/400",
        bio: "Pakar dalam manajemen rantai pasok agrikultur dengan fokus pada keberlanjutan."
    },
    {
        id: 3,
        name: "Ahmad Fauzi",
        position: "Head of Farmer Relations",
        image: "https://placehold.co/400",
        bio: "Memiliki jaringan yang luas dengan komunitas petani di seluruh Indonesia."
    },
    {
        id: 4,
        name: "Siti Rahayu",
        position: "Quality Assurance Director",
        image: "https://placehold.co/400",
        bio: "Ahli standardisasi dan kontrol kualitas untuk komoditas perkebunan."
    }
];

export const milestones = [
    {
        year: 2018,
        title: "Pendirian PT. Arga Bumi Indonesia",
        description: "Dimulai dengan fokus pada kemitraan petani kopi di Lampung."
    },
    {
        year: 2019,
        title: "Ekspansi ke Sumatera Selatan",
        description: "Membuka fasilitas pengolahan pertama dan menambah 5.000 petani mitra."
    },
    {
        year: 2020,
        title: "Program Pelatihan Petani",
        description: "Meluncurkan program pelatihan komprehensif untuk peningkatan kualitas dan produktivitas."
    },
    {
        year: 2021,
        title: "Sertifikasi Internasional",
        description: "Mendapatkan sertifikasi keberlanjutan untuk produk kopi."
    },
    {
        year: 2023,
        title: "Ekspansi ke Bengkulu",
        description: "Membuka gudang ke-15 dan mencapai 20.000 petani mitra."
    },
    {
        year: 2024,
        title: "Program Pembiayaan Petani",
        description: "Meluncurkan program akses pembiayaan kolaborasi dengan LPDB dan BRI."
    }
];

export const partnerLogos = [
    "https://logo.clearbit.com/bankmandiri.co.id",       // Bank Mandiri
    "https://logo.clearbit.com/telkomsel.com",           // Telkomsel             // Gojek
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
];
// Define possible media types
type TestimonialMediaType = 'avatar' | 'image' | 'youtube';

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    mediaType: TestimonialMediaType;
    mediaSrc: string; // Avatar URL, image URL, or YouTube video ID
    rating?: number; // Optional star rating (1-5)
    company?: string; // Optional company name
  }

export const testimonialsData: Testimonial[] = [
    {
        id: 1,
        name: "Jane Cooper",
        role: "Product Manager",
        company: "Acme Inc",
        content: "This product has completely transformed how we work. The team is incredibly responsive and the quality is outstanding.",
        mediaType: "avatar",
        mediaSrc: "https://picsum.photos/seed/picsum/500/300",
        rating: 5
    },
    {
        id: 2,
        name: "John Smith",
        role: "CTO",
        company: "Tech Solutions",
        content: "I've been using this service for over a year and I'm continually impressed by the innovation and attention to detail.",
        mediaType: "youtube",
        mediaSrc: "dQw4w9WgXcQ", // YouTube video ID
        rating: 4
    },
    {
        id: 3,
        name: "Maria Garcia",
        role: "Marketing Director",
        content: "The results we've seen since implementing this solution have exceeded our expectations. Highly recommended!",
        mediaType: "avatar",
        mediaSrc: "https://picsum.photos/seed/picsum/500/300",
        rating: 5,
        company: "Tech Solutions"
    }
];
export interface StatItem {
    label: string;
    value: number;
    icon: React.ElementType;
    valueLabel?: string;
    className?: string;
}

export const stats: StatItem[] = [
    { label: 'Petani Terbantu', value: 12000, icon: Sprout, valueLabel: 'k' },
    { label: 'Lahan Terintegrasi', value: 4500, icon: MapPinned, valueLabel: ' ha' },
    { label: 'Mitra Korporat', value: 32, icon: Handshake, valueLabel: '' },
    { label: 'Proyek Sukses', value: 120, icon: CheckCircle, valueLabel: '%' },
];