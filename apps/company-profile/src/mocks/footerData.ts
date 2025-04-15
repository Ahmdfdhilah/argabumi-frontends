import logo from '../assets/logo_abi_darkmode.png';

export const footerData = {
    companyInfo: {
        logo: logo,
        name: 'PT. Arga Bumi Indonesia',
        offices: [
            {
                name: 'Singapore Office',
                address: '5 Temasek Boulevard, #17–01, Suntec Tower 5, Singapore'
            },
            {
                name: 'Indonesia Office',
                address: 'Ciputra World 89 Mayjen Sungkono, Surabaya, East Java, Indonesia'
            }
        ]
    },
    linkGroups: [
        {
            id: 1,
            title: 'Quick Links',
            links: [
                { text: 'Product', url: '/pms' },
                { text: 'Blog', url: '/blog' },
                { text: 'Careers', url: '/careers' },
                { text: 'News', url: '/news' },
                { text: 'Events', url: '/events' },          
            ]
        },
        {
            id: 2,
            title: 'Company',
            links: [
                { text: 'Mitra Registration', url: '/direct-booking' },
                { text: 'About Us', url: '/ems' },
                { text: 'Contact Us', url: '/contact' },

                { text: 'Sitemap', url: '/sitemap' },
                { text: 'Legal', url: '/legal' }
            ]
        }
    ],
    legalLinks: [
        { text: 'Privacy Policy', url: '/privacy' },
        { text: 'Terms of Services', url: '/terms' }
    ],
    copyrightText: 'Arga Bumi Indonesia © 2025',
    socialMedia: [
        {
            name: 'Facebook',
            icon: 'https://cdn.simpleicons.org/facebook/1877F2',
            url: 'https://www.facebook.com'
        },
        {
            name: 'Twitter',
            icon: 'https://cdn.simpleicons.org/x/fff',
            url: 'https://twitter.com'
        },
        {
            name: 'Instagram',
            icon: 'https://cdn.simpleicons.org/instagram/E4405F',
            url: 'https://www.instagram.com'
        }
    ]
};
