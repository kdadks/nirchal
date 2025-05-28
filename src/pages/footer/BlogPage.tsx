import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const BlogPage: React.FC = () => {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Top Wedding Season Trends for 2025",
      excerpt: "Discover the latest trends in Indian bridal wear and wedding fashion that will dominate the upcoming wedding season.",
      author: "Priya Sharma",
      date: "2025-05-25",
      readTime: "5 min read",
      category: "Wedding Fashion",
      image: "/images/blog/wedding-trends.jpg"
    },
    {
      id: 2,
      title: "Style Guide: Mixing Traditional with Modern",
      excerpt: "Learn how to create the perfect fusion looks by combining traditional Indian elements with contemporary fashion.",
      author: "Arjun Kapoor",
      date: "2025-05-20",
      readTime: "4 min read",
      category: "Style Guide",
      image: "/images/blog/fusion-fashion.jpg"
    },
    {
      id: 3,
      title: "Sustainable Fashion: Our Commitment to the Environment",
      excerpt: "Explore how Nirchal is working towards sustainable fashion and supporting local artisans.",
      author: "Anjali Desai",
      date: "2025-05-15",
      readTime: "6 min read",
      category: "Sustainability",
      image: "/images/blog/sustainable-fashion.jpg"
    },
    {
      id: 4,
      title: "Care Guide: Making Your Ethnic Wear Last Longer",
      excerpt: "Essential tips and tricks to maintain your ethnic wear and keep them looking new for years.",
      author: "Ritu Kumar",
      date: "2025-05-10",
      readTime: "7 min read",
      category: "Care Guide",
      image: "/images/blog/care-guide.jpg"
    }
  ];

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Blog - Nirchal</title>
        <meta name="description" content="Read the latest articles about fashion trends, styling tips, and updates from Nirchal" />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Blog</h1>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button className="px-4 py-2 rounded-full bg-primary-600 text-white">
            All Posts
          </button>
          {categories.map((category, index) => (
            <button
              key={index}
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          <div className="relative h-[400px] rounded-xl overflow-hidden group">
            <img
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <div className="flex items-center gap-4 mb-2 text-sm">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(blogPosts[0].date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {blogPosts[0].author}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {blogPosts[0].readTime}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">
                {blogPosts[0].title}
              </h2>
              <p className="mb-4 text-gray-200">
                {blogPosts[0].excerpt}
              </p>
              <button className="flex items-center text-white hover:text-primary-200">
                Read More <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map(post => (
            <div key={post.id} className="group">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {post.excerpt}
              </p>
              <button className="flex items-center text-primary-600 hover:text-primary-700">
                Read More <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;