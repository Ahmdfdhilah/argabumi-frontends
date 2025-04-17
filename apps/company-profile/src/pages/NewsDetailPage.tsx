import  { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatedSection } from '@workspace/ui/components/ui/animated-section';
import { Section } from '@workspace/ui/components/ui/section';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import NewsDetailSkeleton from '../components/skeleton/NewsDetailSkeleton';
import RecentNewsSidebar from '../components/RecentNewsSidebar';
import { newsItems } from '../mocks/newsData';
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react';
import { NewsItem } from '../utils/types';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Simulate API fetch with delay
    const timer = setTimeout(() => {
      const foundNews = newsItems.find(news => news.id === id);
      setNewsItem(foundNews || null);
      
      // Get other news for sidebar (excluding current)
      const others = newsItems
        .filter(news => news.id !== id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4);
        
      setRecentNews(others);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id]);

  // If news not found after loading
  if (!isLoading && !newsItem) {
    return (
      <Section className="py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Berita Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">Maaf, berita yang Anda cari tidak tersedia.</p>
          <Button asChild>
            <Link to="/news">Kembali ke Daftar Berita</Link>
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        {newsItem && (
          <>
            <title>{newsItem.title} | Company Name</title>
            <meta name="description" content={newsItem.description} />
            <meta name="keywords" content={newsItem.tags?.join(', ')} />
            <link rel="canonical" href={`https://yourcompany.com/news/${newsItem.id}`} />
            <meta property="og:title" content={`${newsItem.title} | Company Name`} />
            <meta property="og:description" content={newsItem.description} />
            <meta property="og:url" content={`https://yourcompany.com/news/${newsItem.id}`} />
            <meta property="og:type" content="article" />
            <meta property="og:image" content={newsItem.imageUrl} />
            <meta property="article:published_time" content={newsItem.date} />
            <meta property="article:author" content={newsItem.author} />
            {newsItem.tags?.map(tag => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}
      </Helmet>

      <div className="bg-gray-50 mt-8 md:mt-16 px-8">
        <AnimatedSection>
          <Section className="py-16">
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="inline-flex items-center">
                <Link to="/news">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Kembali ke Daftar Berita
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <NewsDetailSkeleton />
                ) : (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      {newsItem?.imageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <img
                            src={newsItem.imageUrl}
                            alt={newsItem.title}
                            className="w-full h-full object-cover"
                          />
                          {newsItem.category && (
                            <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                              {newsItem.category}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="p-6">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{newsItem?.title}</h1>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{newsItem?.date}</span>
                          </div>
                          {newsItem?.author && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{newsItem.author}</span>
                            </div>
                          )}
                        </div>
                        
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: newsItem?.content || '' }}
                        />
                        
                        {newsItem?.tags && newsItem?.tags.length > 0 && (
                          <div className="mt-8 pt-4 border-t">
                            <div className="flex flex-wrap gap-2 items-center">
                              <Tag className="h-4 w-4 text-gray-500" />
                              {newsItem.tags.map(tag => (
                                <span 
                                  key={tag} 
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Sidebar */}
              <div>
                <div className="sticky">
                  <RecentNewsSidebar recentNews={recentNews} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </Section>
        </AnimatedSection>
      </div>
    </>
  );
};

export default NewsDetailPage;