// Indian States, Union Territories and Major Cities Data
export interface StateData {
  name: string;
  code: string;
  cities: string[];
}

export const INDIAN_STATES: StateData[] = [
  {
    name: "Andhra Pradesh",
    code: "AP",
    cities: [
      "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", 
      "Tirupati", "Kadapa", "Anantapur", "Chittoor", "Vizianagaram", "Eluru",
      "Ongole", "Srikakulam", "Machilipatnam", "Adoni", "Tenali", "Proddatur",
      "Hindupur", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada"
    ]
  },
  {
    name: "Arunachal Pradesh",
    code: "AR",
    cities: [
      "Itanagar", "Naharlagun", "Pasighat", "Aalo", "Bomdila", "Tawang",
      "Ziro", "Tezu", "Seppa", "Changlang", "Khonsa", "Yingkiong"
    ]
  },
  {
    name: "Assam",
    code: "AS",
    cities: [
      "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia",
      "Tezpur", "Bongaigaon", "Dhubri", "North Lakhimpur", "Karimganj", "Sivasagar",
      "Goalpara", "Diphu", "Barpeta", "Mangaldoi", "Haflong", "Hailakandi"
    ]
  },
  {
    name: "Bihar",
    code: "BR",
    cities: [
      "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga",
      "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra",
      "Danapur", "Saharsa", "Sasaram", "Hajipur", "Dehri", "Siwan",
      "Motihari", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Sitamarhi"
    ]
  },
  {
    name: "Chhattisgarh",
    code: "CG",
    cities: [
      "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon",
      "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund", "Dhamtari", "Chirmiri",
      "Janjgir", "Sakti", "Tilda", "Mungeli", "Manendragarh", "Naila Janjgir"
    ]
  },
  {
    name: "Goa",
    code: "GA",
    cities: [
      "Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim",
      "Curchorem", "Sanquelim", "Quepem", "Cuncolim", "Canacona", "Pernem"
    ]
  },
  {
    name: "Gujarat",
    code: "GJ",
    cities: [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
      "Junagadh", "Gandhinagar", "Anand", "Navsari", "Morbi", "Nadiad",
      "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur",
      "Valsad", "Vapi", "Gondal", "Veraval", "Godhra", "Patan", "Kalol",
      "Dahod", "Botad", "Amreli", "Deesa", "Jetpur"
    ]
  },
  {
    name: "Haryana",
    code: "HR",
    cities: [
      "Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak",
      "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa",
      "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Palwal", "Rewari",
      "Hansi", "Narnaul", "Fatehabad", "Gohana", "Tohana", "Narwana"
    ]
  },
  {
    name: "Himachal Pradesh",
    code: "HP",
    cities: [
      "Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Baddi",
      "Nahan", "Paonta Sahib", "Sundarnagar", "Chamba", "Una", "Kullu",
      "Hamirpur", "Bilaspur", "Kangra", "Manali", "Kasauli", "Dalhousie"
    ]
  },
  {
    name: "Jharkhand",
    code: "JH",
    cities: [
      "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro",
      "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda", "Chaibasa",
      "Gumla", "Dumka", "Godda", "Sahebganj", "Koderma", "Chatra",
      "Lohardaga", "Simdega", "Khunti", "Garhwa", "Latehar", "Pakur"
    ]
  },
  {
    name: "Karnataka",
    code: "KA",
    cities: [
      "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga",
      "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur",
      "Bidar", "Hospet", "Hassan", "Gadag", "Udupi", "Robertsonpet",
      "Bhadravati", "Chitradurga", "Kolar", "Mandya", "Chikmagalur", "Gangavati",
      "Bagalkot", "Ranebennuru", "Karwar", "Sirsi", "Puttur", "Koppal"
    ]
  },
  {
    name: "Kerala",
    code: "KL",
    cities: [
      "Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha",
      "Palakkad", "Kannur", "Kasaragod", "Kottayam", "Pathanamthitta", "Idukki",
      "Malappuram", "Wayanad", "Ernakulam", "Thalassery", "Kayamkulam", "Neyyattinkara",
      "Punalur", "Nilambur", "Changanassery", "Kattappana", "Guruvayoor", "Ponnani"
    ]
  },
  {
    name: "Madhya Pradesh",
    code: "MP",
    cities: [
      "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas",
      "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa",
      "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Chhatarpur",
      "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Narmadapuram",
      "Itarsi", "Sehore", "Betul", "Seoni", "Datia", "Nagda"
    ]
  },
  {
    name: "Maharashtra",
    code: "MH",
    cities: [
      "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur",
      "Amravati", "Kolhapur", "Sangli", "Malegaon", "Akola", "Latur", "Dhule",
      "Ahmednagar", "Chandrapur", "Parbhani", "Jalgaon", "Bhiwandi", "Nanded",
      "Warangal", "Ulhasnagar", "Satara", "Miraj", "Kalyan", "Vasai", "Virar",
      "Panvel", "Badlapur", "Beed", "Gondia", "Barshi", "Yavatmal", "Achalpur",
      "Osmanabad", "Nandurbar", "Wardha", "Udgir", "Hinganghat"
    ]
  },
  {
    name: "Manipur",
    code: "MN",
    cities: [
      "Imphal", "Thoubal", "Lilong", "Mayang Imphal", "Kakching", "Nambol",
      "Moirang", "Churachandpur", "Ukhrul", "Senapati", "Tamenglong", "Jiribam"
    ]
  },
  {
    name: "Meghalaya",
    code: "ML",
    cities: [
      "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Williamnagar",
      "Nongpoh", "Mairang", "Resubelpara", "Ampati", "Mawkyrwat", "Khliehriat"
    ]
  },
  {
    name: "Mizoram",
    code: "MZ",
    cities: [
      "Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip",
      "Mamit", "Lawngtlai", "Saitual", "Hnahthial", "Khawzawl"
    ]
  },
  {
    name: "Nagaland",
    code: "NL",
    cities: [
      "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto",
      "Phek", "Kiphire", "Longleng", "Peren", "Mon", "Noklak"
    ]
  },
  {
    name: "Odisha",
    code: "OR",
    cities: [
      "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri",
      "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore", "Barbil",
      "Khordha", "Sundargarh", "Rayagada", "Kendujhar", "Nabarangpur", "Nimapara",
      "Kamakhyanagar", "Pikusi", "Talcher", "Kendrapara", "Rajgangpur", "Paradip"
    ]
  },
  {
    name: "Punjab",
    code: "PB",
    cities: [
      "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali",
      "Firozpur", "Batala", "Pathankot", "Moga", "Abohar", "Malerkotla",
      "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Hoshiarpur",
      "Kapurthala", "Faridkot", "Sunam", "Sangrur", "Zirakpur", "Kot Kapura",
      "Ropar", "Nabha", "Nakodar", "Zira", "Patti", "Raikot"
    ]
  },
  {
    name: "Rajasthan",
    code: "RJ",
    cities: [
      "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara",
      "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Kishangarh",
      "Baran", "Dhaulpur", "Tonk", "Beawar", "Hanumangarh", "Gangapur City",
      "Banswara", "Makrana", "Sujangarh", "Taranagar", "Sardarshahar", "Churu",
      "Jhunjhunu", "Suratgarh", "Nokha", "Nimbahera", "Sojat", "Ladnu"
    ]
  },
  {
    name: "Sikkim",
    code: "SK",
    cities: [
      "Gangtok", "Namchi", "Geyzing", "Mangan", "Jorethang", "Naya Bazar",
      "Rangpo", "Singtam", "Ravangla", "Yuksom"
    ]
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    cities: [
      "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli",
      "Tiruppur", "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur",
      "Ranipet", "Sivakasi", "Karur", "Udhagamandalam", "Hosur", "Nagercoil",
      "Kanchipuram", "Cuddalore", "Kumbakonam", "Avadi", "Tiruvannamalai", "Pollachi",
      "Rajapalayam", "Pudukkottai", "Neyveli", "Nagapattinam", "Viluppuram", "Tiruvottiyur",
      "Ambur", "Pallavaram", "Tambaram", "Vaniyambadi", "Valparai", "Virudhunagar"
    ]
  },
  {
    name: "Telangana",
    code: "TS",
    cities: [
      "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam",
      "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Jagtial",
      "Mancherial", "Nirmal", "Kothagudem", "Bodhan", "Sangareddy", "Metpally",
      "Zahirabad", "Medak", "Kamareddy", "Vikarabad", "Jangaon", "Mandamarri",
      "Gadwal", "Bellampalle", "Korutla", "Tandur", "Wanaparthy", "Narayanpet"
    ]
  },
  {
    name: "Tripura",
    code: "TR",
    cities: [
      "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia", "Khowai",
      "Pratapgarh", "Ranirbazar", "Amarpur", "Teliamura", "Sabroom", "Kamalpur"
    ]
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    cities: [
      "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad",
      "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida",
      "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Shahjahanpur", "Rampur",
      "Mau", "Farrukhabad", "Hapur", "Ayodhya", "Etawah", "Mirzapur", "Bulandshahr",
      "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Raebareli", "Orai", "Sitapur",
      "Bahraich", "Modinagar", "Unnao", "Jaunpur", "Lakhimpur", "Hathras", "Banda"
    ]
  },
  {
    name: "Uttarakhand",
    code: "UK",
    cities: [
      "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur",
      "Rishikesh", "Ramnagar", "Pithoragarh", "Jaspur", "Manglaur", "Laksar",
      "Sultanpur", "Herbertpur", "Vikasnagar", "Narendra Nagar", "Kotkhai", "Almora",
      "Nainital", "Mussoorie", "Tehri", "Pauri", "Bageshwar", "Champawat"
    ]
  },
  {
    name: "West Bengal",
    code: "WB",
    cities: [
      "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Malda", "Bardhaman",
      "Barasat", "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat",
      "Basirhat", "Bankura", "Purulia", "Tamluk", "Raiganj", "Contai", "Kamarhati",
      "Baranagar", "Bodhan", "Uluberia", "Bhatpara", "Panihati", "Kharagpur",
      "Cooch Behar", "Alipurduar", "Purulia", "Darjeeling", "Kurseong", "Kalimpong"
    ]
  }
];

// Union Territories
export const UNION_TERRITORIES: StateData[] = [
  {
    name: "Andaman and Nicobar Islands",
    code: "AN",
    cities: [
      "Port Blair", "Bamboo Flat", "Garacharma", "Diglipur", "Rangat",
      "Mayabunder", "Campbell Bay", "Car Nicobar", "Hut Bay"
    ]
  },
  {
    name: "Chandigarh",
    code: "CH",
    cities: ["Chandigarh"]
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    code: "DH",
    cities: [
      "Daman", "Diu", "Silvassa", "Dadra", "Nagar Haveli", "Vapi"
    ]
  },
  {
    name: "Delhi",
    code: "DL",
    cities: [
      "New Delhi", "Delhi", "Dwarka", "Rohini", "Pitampura", "Lajpat Nagar",
      "Karol Bagh", "Connaught Place", "Chandni Chowk", "Saket", "Vasant Kunj",
      "Janakpuri", "Rajouri Garden", "Preet Vihar", "Mayur Vihar", "Laxmi Nagar",
      "Shahdara", "Model Town", "Civil Lines", "Khan Market", "Greater Kailash",
      "Defence Colony", "Hauz Khas", "Malviya Nagar", "Green Park", "Kalkaji"
    ]
  },
  {
    name: "Jammu and Kashmir",
    code: "JK",
    cities: [
      "Srinagar", "Jammu", "Baramulla", "Anantnag", "Sopore", "KathuaCity",
      "Udhampur", "Punch", "Rajauri", "Kupwara", "Leh", "Kargil",
      "Budgam", "Pulwama", "Shopian", "Ganderbal", "Bandipora", "Doda",
      "Kishtwar", "Ramban", "Reasi", "Samba", "Rajouri", "Poonch"
    ]
  },
  {
    name: "Ladakh",
    code: "LA",
    cities: ["Leh", "Kargil", "Nubra", "Zanskar", "Drass", "Khalatse"]
  },
  {
    name: "Lakshadweep",
    code: "LD",
    cities: [
      "Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott", "Kalpeni",
      "Kadmat", "Kiltan", "Chetlat", "Bitra"
    ]
  },
  {
    name: "Puducherry",
    code: "PY",
    cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai", "Villianur"]
  }
];

export const ALL_STATES_AND_UTS = [...INDIAN_STATES, ...UNION_TERRITORIES];

// Popular cities across India for search suggestions
export const MAJOR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
  "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad",
  "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivali",
  "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
  "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
  "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati",
  "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore",
  "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem",
  "Mira-Bhayandar", "Warangal", "Thiruvananthapuram", "Guntur", "Bhiwandi",
  "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur",
  "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun",
  "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola",
  "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar",
  "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur",
  "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala"
];

export const findCitiesByState = (stateName: string): string[] => {
  const state = ALL_STATES_AND_UTS.find(s => s.name === stateName);
  return state ? state.cities.sort() : []; // Sort alphabetically
};

export const findStateByCity = (cityName: string): string | null => {
  for (const state of ALL_STATES_AND_UTS) {
    if (state.cities.includes(cityName)) {
      return state.name;
    }
  }
  return null;
};

export const searchCities = (query: string, stateFilter?: string): string[] => {
  const searchTerm = query.toLowerCase();
  let citiesToSearch: string[] = [];

  if (stateFilter) {
    // Search within specific state
    citiesToSearch = findCitiesByState(stateFilter);
  } else {
    // Search all major cities
    citiesToSearch = MAJOR_CITIES;
  }

  const filteredCities = citiesToSearch
    .filter(city => city.toLowerCase().includes(searchTerm));

  // Sort by relevance: exact matches first, then starts with, then contains
  return filteredCities.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    if (aLower === searchTerm) return -1;
    if (bLower === searchTerm) return 1;
    if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1;
    if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1;
    
    return a.localeCompare(b);
  }).slice(0, 20); // Limit to 20 results
};
