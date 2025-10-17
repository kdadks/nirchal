import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  sale_price: number;
  category: string;
  description: string;
  images: string[];
  stock_quantity: number;
  rating: number;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  product_count: number;
}

export const useNirchalAI = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m Nirchal AI, your personal shopping assistant. I can help you find products, check availability, get size recommendations, and answer questions about our collections. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Show me featured sarees',
        'What\'s available in my size?',
        'Check stock for kurtas',
        'Tell me about your return policy'
      ]
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);

  // Predefined responses and patterns
  const predefinedResponses = {
    greetings: [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'
    ],
    productQueries: [
      'show', 'find', 'search', 'looking for', 'want', 'need', 'buy'
    ],
    categories: [
      'saree', 'sarees', 'kurta', 'kurtas', 'lehenga', 'lehanga', 'blouse', 'blouses',
      'dupatta', 'dupattas', 'gown', 'gowns', 'dress', 'dresses', 'skirt', 'skirts',
      'accessories', 'kids', 'men', 'women'
    ],
    inventory: [
      'stock', 'available', 'availability', 'in stock', 'out of stock'
    ],
    policies: [
      'return', 'exchange', 'refund', 'shipping', 'delivery', 'payment', 'size guide'
    ],
    pricing: [
      'price', 'cost', 'cheap', 'expensive', 'discount', 'offer', 'sale'
    ]
  };

  // Fetch product data based on query
  const fetchProducts = useCallback(async (query: string, category?: string, limit: number = 5, featured: boolean = false) => {
    try {
      let dbQuery = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          sale_price,
          category,
          description,
          stock_quantity,
          rating,
          product_images(image_url, display_order)
        `)
        .gt('stock_quantity', 0)
        .order('rating', { ascending: false })
        .limit(limit);

      if (category) {
        dbQuery = dbQuery.eq('category', category);
      }

      if (featured) {
        dbQuery = dbQuery.eq('is_featured', true);
      }

      if (query && !featured) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      return data?.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        sale_price: product.sale_price,
        category: product.category,
        description: product.description,
        images: product.product_images?.map((img: any) => img.image_url) || [],
        stock_quantity: product.stock_quantity,
        rating: product.rating || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }, []);

  // Analyze user intent
  const analyzeIntent = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (predefinedResponses.greetings.some(greeting => lowerMessage.includes(greeting))) {
      return 'greeting';
    }
    
    if (predefinedResponses.productQueries.some(query => lowerMessage.includes(query))) {
      return 'product_search';
    }
    
    if (predefinedResponses.inventory.some(inv => lowerMessage.includes(inv))) {
      return 'inventory_check';
    }
    
    if (predefinedResponses.policies.some(policy => lowerMessage.includes(policy))) {
      return 'policy_info';
    }
    
    if (predefinedResponses.pricing.some(price => lowerMessage.includes(price))) {
      return 'pricing_info';
    }
    
    return 'general';
  };

  // Extract category from message
  const extractCategory = (message: string): string | undefined => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('saree')) return 'Womens Sarees';
    if (lowerMessage.includes('kurta') && lowerMessage.includes('men')) return 'Mens Kurta Sets';
    if (lowerMessage.includes('kurta') || lowerMessage.includes('kurti')) return 'Womens Kurtis';
    if (lowerMessage.includes('lehenga')) return 'Womens Lehenga Choli';
    if (lowerMessage.includes('blouse')) return 'Blouses';
    if (lowerMessage.includes('dupatta')) return 'Dupatta';
    if (lowerMessage.includes('gown')) return 'Womens Gown';
    if (lowerMessage.includes('skirt')) return 'Womens Skirts';
    if (lowerMessage.includes('accessories')) return 'Women Accessories';
    if (lowerMessage.includes('kids') || lowerMessage.includes('children')) return 'Kidswear';
    if (lowerMessage.includes('dress')) return 'Dress Material';
    
    return undefined;
  };

  // Generate intelligent response
  const generateResponse = async (userMessage: string): Promise<string> => {
    const intent = analyzeIntent(userMessage);
    const category = extractCategory(userMessage);
    
    switch (intent) {
      case 'greeting':
        return "Hello! Welcome to Nirchal! I'm here to help you find the perfect ethnic wear. Whether you're looking for sarees, kurtas, lehengas, or any traditional outfit, I can assist you with product recommendations, availability, and more. What are you shopping for today?";
      
      case 'product_search': {
        // Check if user is asking for trending/featured products
        const isTrending = userMessage.toLowerCase().includes('trending') || 
                          userMessage.toLowerCase().includes('popular') || 
                          userMessage.toLowerCase().includes('featured');
        
        const products = await fetchProducts(userMessage, category, 5, isTrending);
        if (products.length > 0) {
          let response = isTrending 
            ? `Here are our featured ${category || 'products'} for you:\n\n`
            : `I found ${products.length} great ${category || 'products'} for you:\n\n`;
          products.forEach((product, index) => {
            const price = product.sale_price > 0 ? product.sale_price : product.price;
            response += `${index + 1}. **${product.name}**\n`;
            response += `   Price: ₹${price.toLocaleString()}\n`;
            response += `   Rating: ${product.rating.toFixed(1)}⭐\n`;
            response += `   Stock: ${product.stock_quantity} pieces available\n\n`;
          });
          response += "Would you like me to show you more details about any of these items?";
          return response;
        } else {
          return `I couldn't find any ${category || 'products'} matching your search. Try browsing our categories: Sarees, Kurtas, Lehengas, Blouses, or Accessories. What type of ethnic wear interests you?`;
        }
      }
      
      case 'inventory_check': {
        const stockProducts = await fetchProducts('', category, 10);
        const totalStock = stockProducts.reduce((sum, product) => sum + product.stock_quantity, 0);
        return `Currently, we have ${totalStock} pieces in stock across ${stockProducts.length} different ${category || 'products'}. Our inventory is updated in real-time. Is there a specific item you'd like me to check availability for?`;
      }
      
      case 'policy_info':
        if (userMessage.toLowerCase().includes('return')) {
          return "📦 **Return Policy**: We offer a 2-day return policy for all items. Products should be in original condition with tags. Return pickup charges may apply. Would you like details about the return process?";
        }
        if (userMessage.toLowerCase().includes('shipping')) {
          return "🚚 **Shipping Info**: FREE shipping on all orders across India! 🇮🇳 No minimum order value. Standard delivery takes 3-7 business days. We deliver pan-India with real-time tracking. International shipping available with charges calculated at checkout.";
        }
        if (userMessage.toLowerCase().includes('size')) {
          return "📏 **Size Guide**: We provide detailed size charts for all categories. Most items are available in XS to XXL. Custom sizing available for select products. Need help with a specific size?";
        }
        return "I can help with return policy, shipping info, size guides, and payment options. What specific policy would you like to know about?";
      
      case 'pricing_info': {
        const priceProducts = await fetchProducts('', category, 20);
        if (priceProducts.length > 0) {
          const prices = priceProducts.map(p => p.sale_price > 0 ? p.sale_price : p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const avgPrice = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
          
          return `💰 **Price Range for ${category || 'our products'}**:\n\n` +
                 `• Starting from: ₹${minPrice.toLocaleString()}\n` +
                 `• Up to: ₹${maxPrice.toLocaleString()}\n` +
                 `• Average price: ₹${avgPrice.toLocaleString()}\n\n` +
                 `We frequently have sales and offers. Currently active: FREE shipping on all orders across India! 🇮🇳🎉`;
        }
        return "Our prices are very competitive with frequent sales and offers. What's your budget range? I can show you the best options within your price point.";
      }
      
      default:
        return "I'm here to help you with anything related to ethnic wear shopping! You can ask me about:\n\n" +
               "• Product recommendations and availability\n" +
               "• Size and fit guidance\n" +
               "• Pricing and offers\n" +
               "• Shipping and return policies\n" +
               "• Style suggestions\n\n" +
               "What would you like to know about?";
    }
  };

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate AI response
    const responseContent = await generateResponse(content);
    
    // Determine suggestions based on response
    let suggestions: string[] = [];
    const intent = analyzeIntent(content);
    
    if (intent === 'product_search') {
      suggestions = ['Show me more options', 'Check availability', 'What sizes are available?', 'Any offers on these?'];
    } else if (intent === 'policy_info') {
      suggestions = ['Show featured products', 'Check my size', 'What\'s new today?', 'Help me choose colors'];
    } else {
      suggestions = ['Show me sarees', 'Latest kurtas', 'Check lehenga collection', 'Kids ethnic wear'];
    }

    const assistantMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: responseContent,
      timestamp: new Date(),
      suggestions
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Hello! I\'m Nirchal AI, your personal shopping assistant. How can I help you find the perfect ethnic wear today?',
        timestamp: new Date(),
        suggestions: [
          'Show me featured sarees',
          'What\'s available in my size?',
          'Check stock for kurtas',
          'Tell me about your return policy'
        ]
      }
    ]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat
  };
};