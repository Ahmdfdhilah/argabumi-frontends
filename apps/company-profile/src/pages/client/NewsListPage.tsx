import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedSection, fadeIn } from '@workspace/ui/components/ui/animated-section';
import { Section } from '@workspace/ui/components/ui/section';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

import { newsItems } from '@/mocks/newsData';
import { Search } from 'lucide-react';
import NewsListSkeleton from '@/components/skeleton/NewsListSkeleton';
import { NewsCard } from '@workspace/ui/components/ui/news-card';
import { NewsItem } from '@/utils/types';
import CarouselHero from '@workspace/ui/components/ui/carousel';

const NewsListPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Featured news for the carousel
    // const featuredNews = newsItems
    //     .filter(item => item.featured) // Assuming you have a 'featured' flag in your news items
    //     .slice(0, 3) // Take top 3 featured items
    //     .map(item => ({
    //         id: item.id,
    //         title: item.title,
    //         description: item.description,
    //         category: item.category,
    //         imageUrl: item.imageUrl,
    //         badge: item.isNew ? "Terbaru" : undefined
    //     }));

    useEffect(() => {
        // Simulate API fetch with a delay
        const timer = setTimeout(() => {
            setNews(newsItems);
            setFilteredNews(newsItems);
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let results = news;

        // Apply category filter
        if (categoryFilter) {
            results = results.filter(item => item.category === categoryFilter);
        }

        // Apply search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            results = results.filter(item =>
                item.title.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower)
            );
        }

        setFilteredNews(results);
    }, [searchTerm, categoryFilter, news]);

    // Get unique categories for filter
    const categories = [...new Set(news.map(item => item.category))];

    return (
        <>
            <Helmet>
                <title>Berita Agrikultur Terbaru | Company Name</title>
                <meta name="description" content="Temukan berita terbaru seputar teknologi, kebijakan, dan inovasi di bidang agrikultur dan pertanian Indonesia." />
                <meta name="keywords" content="berita pertanian, agrikultur, inovasi pertanian, teknologi pertanian" />
                <link rel="canonical" href="https://yourcompany.com/news" />
                <meta property="og:title" content="Berita Agrikultur Terbaru | Company Name" />
                <meta property="og:description" content="Temukan berita terbaru seputar teknologi, kebijakan, dan inovasi di bidang agrikultur dan pertanian Indonesia." />
                <meta property="og:url" content="https://yourcompany.com/news" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://yourcompany.com/images/og-news.jpg" />
            </Helmet>

            {/* Hero Carousel - placed before the main content */}
            <div className="mt-16 md:mt-0">
                <CarouselHero />
            </div>

            <div className="bg-gray-50 px-8">
                <AnimatedSection>
                    <Section className="py-8">
                        {/* Search and filter */}
                        <div className="mb-8 flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <Input
                                    placeholder="Cari berita..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* News grid */}
                        <AnimatedSection variants={fadeIn}>
                            {isLoading ? (
                                <NewsListSkeleton count={6} />
                            ) : filteredNews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredNews.map((newsItem) => (
                                        <NewsCard key={newsItem.id} news={newsItem} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-lg text-gray-500">Tidak ada berita yang sesuai dengan filter yang dipilih.</p>
                                    <Button
                                        className="mt-4"
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCategoryFilter('');
                                        }}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            )}
                        </AnimatedSection>

                        {/* Pagination placeholder */}
                        {!isLoading && filteredNews.length > 0 && (
                            <div className="flex justify-center mt-12">
                                <div className="flex gap-2">
                                    <Button variant="outline" disabled>Previous</Button>
                                    <Button variant="default">1</Button>
                                    <Button variant="outline">2</Button>
                                    <Button variant="outline">3</Button>
                                    <Button variant="outline">Next</Button>
                                </div>
                            </div>
                        )}
                    </Section>
                </AnimatedSection>
            </div>
        </>
    );
};

export default NewsListPage;