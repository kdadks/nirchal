// Comprehensive country, state, and city data for international shipping
export interface Country {
  code: string;
  name: string;
  states: State[];
}

export interface State {
  code: string;
  name: string;
  cities: string[];
}

// Popular countries with their states and major cities - SORTED ALPHABETICALLY
export const countriesData: Country[] = [
  {
    code: 'AT',
    name: 'Austria',
    states: [
      {
        code: 'SAL',
        name: 'Salzburg',
        cities: ['Bad Gastein', 'Hallein', 'Salzburg', 'Saalfelden']
      },
      {
        code: 'TYR',
        name: 'Tyrol',
        cities: ['Innsbruck', 'Kufstein', 'Ötztal', 'Seefeld', 'Zillertal']
      },
      {
        code: 'UPR',
        name: 'Upper Austria',
        cities: ['Leonding', 'Linz', 'Steyr', 'Traun', 'Wels']
      },
      {
        code: 'VIE',
        name: 'Vienna',
        cities: ['Graz', 'Innsbruck', 'Linz', 'Salzburg', 'Vienna']
      }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    states: [
      {
        code: 'NSW',
        name: 'New South Wales',
        cities: ['Canberra', 'Central Coast', 'Newcastle', 'Sydney', 'Wollongong']
      },
      {
        code: 'QLD',
        name: 'Queensland',
        cities: ['Brisbane', 'Cairns', 'Gold Coast', 'Sunshine Coast', 'Townsville']
      },
      {
        code: 'SA',
        name: 'South Australia',
        cities: ['Adelaide', 'Gawler', 'Mount Gambier', 'Port Augusta', 'Whyalla']
      },
      {
        code: 'TAS',
        name: 'Tasmania',
        cities: ['Burnie', 'Devonport', 'Hobart', 'Launceston']
      },
      {
        code: 'VIC',
        name: 'Victoria',
        cities: ['Ballarat', 'Bendigo', 'Geelong', 'Melbourne', 'Shepparton']
      },
      {
        code: 'WA',
        name: 'Western Australia',
        cities: ['Albany', 'Bunbury', 'Fremantle', 'Mandurah', 'Perth']
      }
    ]
  },
  {
    code: 'BE',
    name: 'Belgium',
    states: [
      {
        code: 'BRU',
        name: 'Brussels',
        cities: ['Antwerp', 'Brussels', 'Charleroi', 'Ghent', 'Liège']
      },
      {
        code: 'VLG',
        name: 'Flanders',
        cities: ['Antwerp', 'Bruges', 'Ghent', 'Mechelen', 'Ostend']
      },
      {
        code: 'WAL',
        name: 'Wallonia',
        cities: ['Charleroi', 'Liège', 'Mons', 'Namur', 'Tournai']
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    states: [
      {
        code: 'AB',
        name: 'Alberta',
        cities: ['Calgary', 'Edmonton', 'Lethbridge', 'Red Deer', 'St. Albert']
      },
      {
        code: 'BC',
        name: 'British Columbia',
        cities: ['Burnaby', 'Kelowna', 'Richmond', 'Surrey', 'Vancouver', 'Victoria']
      },
      {
        code: 'MB',
        name: 'Manitoba',
        cities: ['Brandon', 'Flin Flon', 'Missinippi', 'Winnipeg']
      },
      {
        code: 'ON',
        name: 'Ontario',
        cities: ['Brampton', 'Hamilton', 'London', 'Mississauga', 'Ottawa', 'Toronto']
      },
      {
        code: 'QC',
        name: 'Quebec',
        cities: ['Gatineau', 'Laval', 'Longueuil', 'Montreal', 'Quebec City']
      }
    ]
  },
  {
    code: 'CH',
    name: 'Switzerland',
    states: [
      {
        code: 'BAS',
        name: 'Basel-Landschaft',
        cities: ['Basel', 'Bettingen', 'Liestal', 'Pratteln', 'Riehen']
      },
      {
        code: 'BER',
        name: 'Bern',
        cities: ['Bern', 'Biel', 'Burgdorf', 'Langenthal', 'Thun']
      },
      {
        code: 'GEN',
        name: 'Geneva',
        cities: ['Geneva', 'Lausanne', 'Montreux', 'Nyon', 'Vevey']
      },
      {
        code: 'ZUR',
        name: 'Zurich',
        cities: ['Dübendorf', 'Schlieren', 'Uster', 'Winterthur', 'Zurich']
      }
    ]
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    states: [
      {
        code: 'BRN',
        name: 'Brno',
        cities: ['Brno', 'Olomouc', 'Přerov', 'Prostějov', 'Šumperk']
      },
      {
        code: 'PLZ',
        name: 'Plzen',
        cities: ['Cheb', 'Domažlice', 'Karlovy Vary', 'Plzen', 'Rokycany']
      },
      {
        code: 'PRA',
        name: 'Prague',
        cities: ['Byšice', 'Kladno', 'Mělník', 'Prague', 'Přelouč']
      }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    states: [
      {
        code: 'BE',
        name: 'Berlin',
        cities: ['Berlin']
      },
      {
        code: 'BW',
        name: 'Baden-Württemberg',
        cities: ['Freiburg', 'Heidelberg', 'Karlsruhe', 'Mannheim', 'Stuttgart']
      },
      {
        code: 'BY',
        name: 'Bavaria',
        cities: ['Augsburg', 'Ingolstadt', 'Munich', 'Nuremberg', 'Regensburg']
      },
      {
        code: 'HE',
        name: 'Hesse',
        cities: ['Darmstadt', 'Frankfurt', 'Hanau', 'Offenbach', 'Wiesbaden']
      },
      {
        code: 'HH',
        name: 'Hamburg',
        cities: ['Hamburg']
      },
      {
        code: 'NW',
        name: 'North Rhine-Westphalia',
        cities: ['Cologne', 'Dortmund', 'Duisburg', 'Düsseldorf', 'Essen']
      }
    ]
  },
  {
    code: 'DK',
    name: 'Denmark',
    states: [
      {
        code: 'ARH',
        name: 'Aarhus',
        cities: ['Aalborg', 'Aarhus', 'Horsens', 'Randers', 'Silkeborg']
      },
      {
        code: 'CPH',
        name: 'Copenhagen',
        cities: ['Copenhagen', 'Frederiksberg', 'Gentofte', 'Lyngby-Taarbæk', 'Rødovre']
      },
      {
        code: 'ODD',
        name: 'Odense',
        cities: ['Bogense', 'Faaborg', 'Kerteminde', 'Odense', 'Svendborg']
      }
    ]
  },
  {
    code: 'ES',
    name: 'Spain',
    states: [
      {
        code: 'AND',
        name: 'Andalusia',
        cities: ['Almería', 'Córdoba', 'Granada', 'Jaén', 'Málaga', 'Seville']
      },
      {
        code: 'CAT',
        name: 'Catalonia',
        cities: ['Barcelona', 'Girona', 'Lleida', 'Manresa', 'Tarragona']
      },
      {
        code: 'GLC',
        name: 'Galicia',
        cities: ['A Coruña', 'Ourense', 'Pontevedra', 'Santiago de Compostela', 'Vigo']
      },
      {
        code: 'MAD',
        name: 'Madrid',
        cities: ['Alcalá de Henares', 'Alcorcón', 'Madrid', 'Torrejón de Ardoz']
      },
      {
        code: 'VAL',
        name: 'Valencia',
        cities: ['Alicante', 'Benidorm', 'Castellón de la Plana', 'Elche', 'Valencia']
      }
    ]
  },
  {
    code: 'FR',
    name: 'France',
    states: [
      {
        code: 'ALSACE',
        name: 'Grand Est',
        cities: ['Metz', 'Mulhouse', 'Nancy', 'Reims', 'Strasbourg']
      },
      {
        code: 'AUVRA',
        name: 'Auvergne-Rhône-Alpes',
        cities: ['Annecy', 'Grenoble', 'Lyon', 'Saint-Étienne', 'Villeurbanne']
      },
      {
        code: 'BFC',
        name: 'Bourgogne-Franche-Comté',
        cities: ['Auxerre', 'Besançon', 'Chalon-sur-Saône', 'Dijon']
      },
      {
        code: 'IDF',
        name: 'Île-de-France',
        cities: ['Boulogne-Billancourt', 'Neuilly-sur-Seine', 'Paris', 'Saint-Denis', 'Versailles']
      },
      {
        code: 'NBOURGOGNE',
        name: 'Nouvelle-Aquitaine',
        cities: ['Angouleme', 'Bordeaux', 'La Rochelle', 'Limoges', 'Poitiers']
      },
      {
        code: 'OCCITANIE',
        name: 'Occitanie',
        cities: ['Beziers', 'Montpellier', 'Nimes', 'Perpignan', 'Toulouse']
      },
      {
        code: 'PACA',
        name: 'Provence-Alpes-Cote d\'Azur',
        cities: ['Aix-en-Provence', 'Cannes', 'Marseille', 'Nice', 'Toulon']
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    states: [
      {
        code: 'ENG',
        name: 'England',
        cities: ['Birmingham', 'Bristol', 'Leeds', 'Liverpool', 'London', 'Manchester', 'Newcastle', 'Nottingham']
      },
      {
        code: 'NIR',
        name: 'Northern Ireland',
        cities: ['Armagh', 'Bangor', 'Belfast', 'Derry', 'Lisburn']
      },
      {
        code: 'SCT',
        name: 'Scotland',
        cities: ['Aberdeen', 'Dundee', 'Edinburgh', 'Glasgow', 'Perth', 'Stirling']
      },
      {
        code: 'WLS',
        name: 'Wales',
        cities: ['Bangor', 'Cardiff', 'Newport', 'Swansea', 'Wrexham']
      }
    ]
  },
  {
    code: 'GR',
    name: 'Greece',
    states: [
      {
        code: 'ATH',
        name: 'Athens',
        cities: ['Acharnes', 'Athens', 'Kallithea', 'Piraeus', 'Vyronas']
      },
      {
        code: 'CRT',
        name: 'Crete',
        cities: ['Agios Nikolaos', 'Chania', 'Heraklion', 'Ierapetra', 'Rethymno']
      },
      {
        code: 'THH',
        name: 'Thessaloniki',
        cities: ['Kozani', 'Larissa', 'Thessaloniki', 'Trikala', 'Volos']
      }
    ]
  },
  {
    code: 'ID',
    name: 'Indonesia',
    states: [
      {
        code: 'BAL',
        name: 'Bali',
        cities: ['Canggu', 'Denpasar', 'Kuta', 'Sanur', 'Ubud']
      },
      {
        code: 'JAK',
        name: 'Jakarta',
        cities: ['Bandung', 'Bogor', 'Depok', 'Jakarta', 'Tangerang']
      },
      {
        code: 'JBR',
        name: 'Surabaya',
        cities: ['Gresik', 'Malang', 'Pasuruan', 'Sidoarjo', 'Surabaya']
      },
      {
        code: 'MED',
        name: 'Medan',
        cities: ['Binjai', 'Langkat', 'Medan', 'Pematang Siantar', 'Tebing Tinggi']
      }
    ]
  },
  {
    code: 'IE',
    name: 'Ireland',
    states: [
      {
        code: 'COR',
        name: 'Cork',
        cities: ['Cobh', 'Cork', 'Fermoy', 'Macroom', 'Youghal']
      },
      {
        code: 'DUB',
        name: 'Dublin',
        cities: ['Dublin', 'Dun Laoghaire', 'Howth', 'Malahide', 'Swords']
      },
      {
        code: 'GAL',
        name: 'Galway',
        cities: ['Athenry', 'Ballinasloe', 'Clifden', 'Galway', 'Salthill']
      },
      {
        code: 'LIM',
        name: 'Limerick',
        cities: ['Ennis', 'Limerick', 'Newcastle West', 'Rathkeale', 'Shannon']
      },
      {
        code: 'WEX',
        name: 'Wexford',
        cities: ['Duncannon', 'Enniscorthy', 'New Ross', 'Waterford', 'Wexford']
      },
      {
        code: 'WFD',
        name: 'Waterford',
        cities: ['Cappoquin', 'Dungarvan', 'Lismore', 'Tramore', 'Waterford']
      }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    states: [
      {
        code: 'AP',
        name: 'Andhra Pradesh',
        cities: ['Guntur', 'Nellore', 'Tirupati', 'Vijayawada', 'Visakhapatnam']
      },
      {
        code: 'BR',
        name: 'Bihar',
        cities: ['Bhagalpur', 'Darbhanga', 'Gaya', 'Muzaffarpur', 'Patna']
      },
      {
        code: 'DL',
        name: 'Delhi',
        cities: ['Delhi', 'Faridabad', 'Ghaziabad', 'New Delhi', 'Noida']
      },
      {
        code: 'GJ',
        name: 'Gujarat',
        cities: ['Ahmedabad', 'Bhavnagar', 'Gandhinagar', 'Jamnagar', 'Rajkot', 'Surat', 'Vadodara']
      },
      {
        code: 'HR',
        name: 'Haryana',
        cities: ['Faridabad', 'Gurgaon', 'Hisar', 'Panipat', 'Rohtak']
      },
      {
        code: 'HP',
        name: 'Himachal Pradesh',
        cities: ['Kangra', 'Kullu', 'Mandi', 'Shimla', 'Solan']
      },
      {
        code: 'JK',
        name: 'Jammu and Kashmir',
        cities: ['Jammu', 'Kargil', 'Leh', 'Srinagar']
      },
      {
        code: 'KA',
        name: 'Karnataka',
        cities: ['Bangalore', 'Belgaum', 'Gulbarga', 'Hubli', 'Mangalore', 'Mysore', 'Shimoga']
      },
      {
        code: 'KL',
        name: 'Kerala',
        cities: ['Kannur', 'Kochi', 'Kozhikode', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur']
      },
      {
        code: 'MH',
        name: 'Maharashtra',
        cities: ['Amravati', 'Aurangabad', 'Jalgaon', 'Kolhapur', 'Mumbai', 'Nagpur', 'Nashik', 'Pune', 'Solapur']
      },
      {
        code: 'MP',
        name: 'Madhya Pradesh',
        cities: ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur', 'Ujjain']
      },
      {
        code: 'OD',
        name: 'Odisha',
        cities: ['Balasore', 'Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur']
      },
      {
        code: 'PB',
        name: 'Punjab',
        cities: ['Amritsar', 'Chandigarh', 'Jalandhar', 'Ludhiana', 'Patiala']
      },
      {
        code: 'RJ',
        name: 'Rajasthan',
        cities: ['Ajmer', 'Bikaner', 'Jaipur', 'Jodhpur', 'Kota', 'Udaipur']
      },
      {
        code: 'TG',
        name: 'Telangana',
        cities: ['Hyderabad', 'Karimnagar', 'Khammam', 'Nizamabad', 'Warangal']
      },
      {
        code: 'TN',
        name: 'Tamil Nadu',
        cities: ['Bangalore', 'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tirupur', 'Vellore']
      },
      {
        code: 'UP',
        name: 'Uttar Pradesh',
        cities: ['Agra', 'Ghaziabad', 'Kanpur', 'Lucknow', 'Meerut', 'Noida', 'Varanasi']
      },
      {
        code: 'WB',
        name: 'West Bengal',
        cities: ['Asansol', 'Darjeeling', 'Durgapur', 'Kolkata', 'Siliguri']
      }
    ]
  },
  {
    code: 'IT',
    name: 'Italy',
    states: [
      {
        code: 'CAM',
        name: 'Campania',
        cities: ['Caserta', 'Naples', 'Pompeii', 'Salerno', 'Torre Annunziata']
      },
      {
        code: 'LAZ',
        name: 'Lazio',
        cities: ['Civitavecchia', 'Formia', 'Frascati', 'Grottaferrata', 'Rome']
      },
      {
        code: 'LOM',
        name: 'Lombardy',
        cities: ['Bergamo', 'Como', 'Lecco', 'Milan', 'Monza', 'Varese']
      },
      {
        code: 'PID',
        name: 'Piedmont',
        cities: ['Alessandria', 'Asti', 'Cuneo', 'Novara', 'Turin']
      },
      {
        code: 'TUS',
        name: 'Tuscany',
        cities: ['Arezzo', 'Florence', 'Livorno', 'Pisa', 'Siena']
      },
      {
        code: 'VEN',
        name: 'Veneto',
        cities: ['Padua', 'Treviso', 'Venice', 'Verona', 'Vicenza']
      }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    states: [
      {
        code: 'AIC',
        name: 'Aichi',
        cities: ['Anjo', 'Nagoya', 'Okazaki', 'Toyota']
      },
      {
        code: 'FUK',
        name: 'Fukuoka',
        cities: ['Fukuoka', 'Kitakyushu', 'Kurume', 'Omuta']
      },
      {
        code: 'KGW',
        name: 'Kanagawa',
        cities: ['Kawasaki', 'Sagamihara', 'Yamato', 'Yokohama']
      },
      {
        code: 'OSK',
        name: 'Osaka',
        cities: ['Kobe', 'Kyoto', 'Osaka', 'Sakai', 'Suita']
      },
      {
        code: 'TYO',
        name: 'Tokyo',
        cities: ['Chiyoda', 'Minato', 'Shibuya', 'Shinjuku', 'Tokyo']
      }
    ]
  },
  {
    code: 'KR',
    name: 'South Korea',
    states: [
      {
        code: 'BUS',
        name: 'Busan',
        cities: ['Busan', 'Changwon', 'Daegu', 'Gimhae', 'Ulsan']
      },
      {
        code: 'DJN',
        name: 'Daejeon',
        cities: ['Boeun', 'Chungju', 'Daejeon', 'Gongju', 'Sejong']
      },
      {
        code: 'GGD',
        name: 'Gyeonggi-do',
        cities: ['Ansan', 'Anyang', 'Seongnam', 'Suwon', 'Yongin']
      },
      {
        code: 'SEL',
        name: 'Seoul',
        cities: ['Bucheon', 'Gimpo', 'Incheon', 'Paju', 'Seoul']
      }
    ]
  },
  {
    code: 'MY',
    name: 'Malaysia',
    states: [
      {
        code: 'JHR',
        name: 'Johor',
        cities: ['Batu Pahat', 'Johor Bahru', 'Kluang', 'Muar', 'Skudai']
      },
      {
        code: 'KUL',
        name: 'Kuala Lumpur',
        cities: ['Kuala Lumpur', 'Petaling Jaya', 'Putrajaya', 'Selangor', 'Shah Alam']
      },
      {
        code: 'PEN',
        name: 'Penang',
        cities: ['Batu Ferringhi', 'Butterworth', 'George Town', 'Pulau Pinang', 'Seberang Perai']
      },
      {
        code: 'SBH',
        name: 'Sabah',
        cities: ['Kota Kinabalu', 'Lahad Datu', 'Sandakan', 'Semporna', 'Tawau']
      }
    ]
  },
  {
    code: 'NL',
    name: 'Netherlands',
    states: [
      {
        code: 'GLD',
        name: 'Gelderland',
        cities: ['Apeldoorn', 'Arnhem', 'Ede', 'Nijmegen', 'Wageningen']
      },
      {
        code: 'NB',
        name: 'North Brabant',
        cities: ['Breda', 'Eindhoven', 'Helmond', 'Tilburg', '\'s-Hertogenbosch']
      },
      {
        code: 'NH',
        name: 'North Holland',
        cities: ['Alkmaar', 'Amsterdam', 'Haarlem', 'Purmerend', 'Zaandam']
      },
      {
        code: 'SH',
        name: 'South Holland',
        cities: ['Delft', 'Dordrecht', 'Leiden', 'Rotterdam', 'The Hague']
      },
      {
        code: 'UT',
        name: 'Utrecht',
        cities: ['Amersfoort', 'Utrecht', 'Veenendaal', 'Zeist']
      }
    ]
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    states: [
      {
        code: 'AUK',
        name: 'Auckland',
        cities: ['Auckland', 'Manukau', 'Papakura', 'Rodney', 'Waitakere']
      },
      {
        code: 'CHC',
        name: 'Canterbury',
        cities: ['Ashburton', 'Christchurch', 'Oamaru', 'Rangiora', 'Timaru']
      },
      {
        code: 'OTA',
        name: 'Otago',
        cities: ['Alexandra', 'Arrowtown', 'Dunedin', 'Queenstown', 'Wanaka']
      },
      {
        code: 'WLG',
        name: 'Wellington',
        cities: ['Lower Hutt', 'Masterton', 'Porirua', 'Upper Hutt', 'Wellington']
      }
    ]
  },
  {
    code: 'PH',
    name: 'Philippines',
    states: [
      {
        code: 'CEB',
        name: 'Cebu',
        cities: ['Bohol', 'Cebu City', 'Danao', 'Lapu-Lapu', 'Mandaue']
      },
      {
        code: 'DVO',
        name: 'Davao',
        cities: ['Calinog', 'Cotabato', 'Davao City', 'General Santos', 'Zamboanga']
      },
      {
        code: 'ILO',
        name: 'Iloilo',
        cities: ['Aklan', 'Antique', 'Capiz', 'Guimaras', 'Iloilo City']
      },
      {
        code: 'NCR',
        name: 'Metro Manila',
        cities: ['Caloocan', 'Makati', 'Manila', 'Quezon City', 'Taguig']
      }
    ]
  },
  {
    code: 'PL',
    name: 'Poland',
    states: [
      {
        code: 'GDA',
        name: 'Gdansk',
        cities: ['Danzig', 'Gdansk', 'Gdynia', 'Sopot', 'Tczew']
      },
      {
        code: 'KRK',
        name: 'Krakow',
        cities: ['Krakow', 'Limanowa', 'Nowy Sącz', 'Tarnów', 'Wieliczka']
      },
      {
        code: 'WAR',
        name: 'Warsaw',
        cities: ['Konstancin-Jeziorna', 'Milanówek', 'Otwock', 'Piaseczno', 'Warsaw']
      },
      {
        code: 'WRO',
        name: 'Wroclaw',
        cities: ['Bolków', 'Jaworzyna Śląska', 'Jelgava', 'Legnica', 'Wroclaw']
      }
    ]
  },
  {
    code: 'PT',
    name: 'Portugal',
    states: [
      {
        code: 'ALG',
        name: 'Algarve',
        cities: ['Albufeira', 'Faro', 'Lagos', 'Portimão', 'Quarteira']
      },
      {
        code: 'BRG',
        name: 'Braga',
        cities: ['Braga', 'Castelo Branco', 'Covilhã', 'Fundão', 'Guarda']
      },
      {
        code: 'LIS',
        name: 'Lisbon',
        cities: ['Almada', 'Barreiro', 'Cascais', 'Lisbon', 'Setúbal']
      },
      {
        code: 'OPO',
        name: 'Porto',
        cities: ['Espinho', 'Gaia', 'Maia', 'Porto', 'Santa Maria da Feira']
      }
    ]
  },
  {
    code: 'SE',
    name: 'Sweden',
    states: [
      {
        code: 'GBG',
        name: 'Gothenburg',
        cities: ['Gothenburg', 'Kungsbacka', 'Lerum', 'Mölndal', 'Partille']
      },
      {
        code: 'MAL',
        name: 'Malmo',
        cities: ['Helsingborg', 'Landskrona', 'Lund', 'Malmo', 'Ystad']
      },
      {
        code: 'STO',
        name: 'Stockholm',
        cities: ['Solna', 'Stockholm', 'Sundbyberg', 'Täby', 'Västerås']
      },
      {
        code: 'UPS',
        name: 'Uppsala',
        cities: ['Gävle', 'Östersund', 'Stockholm', 'Sundsvall', 'Uppsala']
      }
    ]
  },
  {
    code: 'SG',
    name: 'Singapore',
    states: [
      {
        code: 'CENTRAL',
        name: 'Central',
        cities: ['Bugis', 'Civic District', 'Marina Bay', 'Singapore']
      },
      {
        code: 'EAST',
        name: 'East',
        cities: ['Bedok', 'Changi', 'Pasir Ris', 'Tampines']
      },
      {
        code: 'NORTH',
        name: 'North',
        cities: ['Ang Mo Kio', 'Sembawang', 'Woodlands', 'Yishun']
      },
      {
        code: 'WEST',
        name: 'West',
        cities: ['Bukit Batok', 'Choa Chu Kang', 'Clementi', 'Jurong']
      }
    ]
  },
  {
    code: 'TH',
    name: 'Thailand',
    states: [
      {
        code: 'BKK',
        name: 'Bangkok',
        cities: ['Bangkok', 'Din Daeng', 'Dusit', 'Phra Nakhon', 'Thonburi']
      },
      {
        code: 'CMI',
        name: 'Chiang Mai',
        cities: ['Chiang Mai', 'Chiang Rai', 'Lamphun', 'Lampang', 'Mae Hong Son']
      },
      {
        code: 'CNP',
        name: 'Chon Buri',
        cities: ['Chachoengsao', 'Chon Buri', 'Pattaya', 'Rayong', 'Samut Prakan']
      },
      {
        code: 'HUA',
        name: 'Hua Hin',
        cities: ['Hua Hin', 'Kanchanaburi', 'Phetchaburi', 'Prachuap Khiri Khan', 'Ratchaburi']
      }
    ]
  },
  {
    code: 'UAE',
    name: 'United Arab Emirates',
    states: [
      {
        code: 'AUH',
        name: 'Abu Dhabi',
        cities: ['Abu Dhabi', 'Al Ain', 'Jebel Ali', 'Karama']
      },
      {
        code: 'DXB',
        name: 'Dubai',
        cities: ['Bur Dubai', 'Deira', 'Dubai', 'Jumeirah', 'Marina']
      },
      {
        code: 'SHJ',
        name: 'Sharjah',
        cities: ['Ajman', 'Khor Fakkan', 'Ras Al Khaimah', 'Sharjah']
      }
    ]
  },
  {
    code: 'US',
    name: 'United States',
    states: [
      {
        code: 'AZ',
        name: 'Arizona',
        cities: ['Chandler', 'Mesa', 'Phoenix', 'Scottsdale', 'Tempe', 'Tucson']
      },
      {
        code: 'CA',
        name: 'California',
        cities: ['Fresno', 'Long Beach', 'Los Angeles', 'Oakland', 'Sacramento', 'San Diego', 'San Francisco']
      },
      {
        code: 'FL',
        name: 'Florida',
        cities: ['Fort Lauderdale', 'Jacksonville', 'Miami', 'Orlando', 'Tallahassee', 'Tampa']
      },
      {
        code: 'GA',
        name: 'Georgia',
        cities: ['Athens', 'Atlanta', 'Augusta', 'Columbus', 'Marietta', 'Savannah']
      },
      {
        code: 'IL',
        name: 'Illinois',
        cities: ['Aurora', 'Chicago', 'Joliet', 'Naperville', 'Rockford', 'Springfield']
      },
      {
        code: 'MA',
        name: 'Massachusetts',
        cities: ['Boston', 'Cambridge', 'Lowell', 'Quincy', 'Springfield', 'Worcester']
      },
      {
        code: 'NY',
        name: 'New York',
        cities: ['Albany', 'Buffalo', 'New York City', 'Rochester', 'Syracuse', 'Yonkers']
      },
      {
        code: 'PA',
        name: 'Pennsylvania',
        cities: ['Allentown', 'Erie', 'Philadelphia', 'Pittsburgh', 'Reading', 'Scranton']
      },
      {
        code: 'TX',
        name: 'Texas',
        cities: ['Austin', 'Dallas', 'El Paso', 'Fort Worth', 'Houston', 'San Antonio']
      },
      {
        code: 'WA',
        name: 'Washington',
        cities: ['Bellevue', 'Everett', 'Kent', 'Seattle', 'Spokane', 'Tacoma']
      }
    ]
  },
  {
    code: 'VN',
    name: 'Vietnam',
    states: [
      {
        code: 'DNO',
        name: 'Da Nang',
        cities: ['Da Nang', 'Hoi An', 'Hue', 'Quang Ngai', 'Tam Ky']
      },
      {
        code: 'HNI',
        name: 'Hanoi',
        cities: ['Hanoi', 'Haiphong', 'Ninh Binh', 'Thanh Hoa', 'Vinh']
      },
      {
        code: 'SGN',
        name: 'Ho Chi Minh City',
        cities: ['Bien Hoa', 'Can Tho', 'Ho Chi Minh City', 'My Tho', 'Vung Tau']
      }
    ]
  }
];

// Helper function to get country by code
export const getCountryByCode = (code: string): Country | undefined => {
  return countriesData.find(country => country.code === code);
};

// Helper function to get states by country code
export const getStatesByCountry = (countryCode: string): State[] => {
  const country = getCountryByCode(countryCode);
  return country ? country.states : [];
};

// Helper function to get cities by state
export const getCitiesByState = (countryCode: string, stateCode: string): string[] => {
  const states = getStatesByCountry(countryCode);
  const state = states.find(s => s.code === stateCode);
  return state ? state.cities : [];
};

// Get all countries for dropdown
export const getAllCountries = (): { code: string; name: string }[] => {
  return countriesData.map(country => ({ code: country.code, name: country.name }));
};

// Get filtered countries based on currency (hide India for non-INR currencies)
export const getFilteredCountries = (currency?: string): { code: string; name: string }[] => {
  let filtered = countriesData;
  // If currency is USD or EUR, hide India from the list
  if (currency && (currency === 'USD' || currency === 'EUR')) {
    filtered = countriesData.filter(country => country.code !== 'IN');
  }
  return filtered.map(country => ({ code: country.code, name: country.name }));
};
