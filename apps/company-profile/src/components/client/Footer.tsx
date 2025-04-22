// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export interface Office {
    name: string;
    address: string;
}

export interface FooterLink {
    text: string;
    url: string;
}

export interface LinkGroup {
    id: number;
    title: string;
    links: FooterLink[];
}

export interface SocialMedia {
    name: string;
    icon: string;
    url: string;
}

export interface FooterProps {
    companyInfo: {
        logo: string;
        name: string;
        offices: Office[];
    };
    linkGroups: LinkGroup[];
    legalLinks: FooterLink[];
    copyrightText: string;
    socialMedia: SocialMedia[];
}

function Footer({
    companyInfo,
    linkGroups,
    legalLinks,
    copyrightText,
    socialMedia
}: FooterProps) {
    return (

        <footer className="bg-primary text-white">
            <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
                {/* Main company info */}
                <div className="mb-8">
                    <div className="py-8">
                        <img
                            src={companyInfo.logo}
                            className="h-16"
                            alt={companyInfo.name}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
                        <div>
                            <h2 className="font-bold mb-2 text-accent">
                                {companyInfo.name}
                            </h2>
                            {companyInfo.offices.map((office, index) => (
                                <div key={index}>
                                    <p className="mb-1">{office.name}</p>
                                    <p className="text-accent">{office.address}</p>
                                    {index < companyInfo.offices.length - 1 && (
                                        <div className="mt-2"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                            {/* Dynamic link groups */}
                            {linkGroups.map((group) => (
                                <div key={group.id}>
                                    <h3 className="font-bold mb-4 text-accent">
                                        {group.title}
                                    </h3>
                                    <ul className="space-y-2">
                                        {group.links.map((link, index) => (
                                            <li key={index}>
                                                <Link
                                                    to={link.url}
                                                    className="hover:text-accent transition-colors"
                                                >
                                                    {link.text}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Social media links */}
                            <div>
                                <h3 className="font-bold mb-4 text-accent">
                                    Connect With Us
                                </h3>
                                <div className="flex space-x-4">
                                    {socialMedia.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-accent transition-colors"
                                            aria-label={social.name}
                                        >
                                            <img
                                                src={`${social.icon}`}
                                                alt={social.name}
                                                className="h-6 w-6"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright and legal links */}
                <div className="border-t border-accent pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-accent mb-2 md:mb-0">
                        {copyrightText}
                    </p>
                    <div className="flex space-x-4">
                        {legalLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.url}
                                className="text-accent hover:text-white transition-colors"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;