import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Clock, Mail, Search } from 'lucide-react';

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const StoreLocatorPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const stores: Store[] = [
    {
      id: 1,
      name: "Nirchal Flagship Store",
      address: "123 Fashion Street, Fort",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 22 1234 5678",
      email: "mumbai.fort@nirchal.com",
      hours: "10:00 AM - 9:00 PM (Mon-Sun)",
      coordinates: {
        lat: 18.9322,
        lng: 72.8313
      }
    },
    {
      id: 2,
      name: "Nirchal Premium Outlet",
      address: "45 MG Road, Bangalore Central",
      city: "Bangalore",
      state: "Karnataka",
      phone: "+91 80 2345 6789",
      email: "bangalore.central@nirchal.com",
      hours: "10:00 AM - 9:00 PM (Mon-Sun)",
      coordinates: {
        lat: 12.9716,
        lng: 77.5946
      }
    },
    {
      id: 3,
      name: "Nirchal Designer Studio",
      address: "789 Linking Road, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      phone: "+91 22 3456 7890",
      email: "mumbai.bandra@nirchal.com",
      hours: "11:00 AM - 8:00 PM (Mon-Sun)",
      coordinates: {
        lat: 19.0596,
        lng: 72.8295
      }
    },
    {
      id: 4,
      name: "Nirchal South Extension",
      address: "56 South Extension Part II",
      city: "New Delhi",
      state: "Delhi",
      phone: "+91 11 4567 8901",
      email: "delhi.south@nirchal.com",
      hours: "10:00 AM - 8:00 PM (Mon-Sun)",
      coordinates: {
        lat: 28.5673,
        lng: 77.2237
      }
    }
  ];

  const cities = Array.from(new Set(stores.map(store => store.city)));

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = selectedCity === 'all' || store.city === selectedCity;

    return matchesSearch && matchesCity;
  });

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Store Locator - Nirchal</title>
        <meta name="description" content="Find Nirchal stores near you" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-serif font-bold text-gray-900">Store Locator</h1>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location or store name"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Store List */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredStores.map(store => (
            <div
              key={store.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-500 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{store.name}</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600">{store.address}</p>
                    <p className="text-gray-600">{store.city}, {store.state}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-primary-600 mr-3" />
                  <a href={`tel:${store.phone}`} className="text-gray-600 hover:text-primary-600">
                    {store.phone}
                  </a>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-primary-600 mr-3" />
                  <a href={`mailto:${store.email}`} className="text-gray-600 hover:text-primary-600">
                    {store.email}
                  </a>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary-600 mr-3" />
                  <span className="text-gray-600">{store.hours}</span>
                </div>
              </div>

              <button
                className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={() => window.open(`https://www.google.com/maps?q=${store.coordinates.lat},${store.coordinates.lng}`, '_blank')}
              >
                Get Directions
              </button>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No stores found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocatorPage;