const fs = require('fs');
const axios = require('axios');

const locations = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Srikakulam", "Vizianagaram", "Ongole", "Eluru", "Machilipatnam", "Kakinada", "Chittoor"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Naharlagun", "Pasighat", "Ziro", "Bomdila", "Along", "Tezu", "Roing", "Changlang"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur", "Nagaon", "Tinsukia", "Sivasagar", "Dhubri", "Diphu"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Chapra", "Bihar Sharif"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Jagdalpur", "Raigarh", "Ambikapur", "Rajnandgaon", "Dhamtari"],
  "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda", "Bicholim", "Curchorem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Bharuch", "Bhuj", "Morbi", "Mehsana", "Palanpur", "Navsari", "Vapi", "Porbandar", "Godhra"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Rohtak", "Karnal", "Sonipat", "Yamunanagar", "Panchkula", "Rewari", "Bhiwani"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Mandi", "Solan", "Kullu", "Chamba", "Hamirpur", "Bilaspur", "Nahan", "Una", "Kinnaur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Chaibasa", "Dumka"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Ballari", "Shivamogga", "Tumakuru", "Udupi", "Davangere", "Hassan", "Vijayapura", "Raichur", "Chitradurga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Kottayam", "Malappuram", "Idukki", "Wayanad", "Kasaragod", "Pathanamthitta"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Ratlam", "Dewas", "Khandwa", "Burhanpur", "Chhindwara", "Shivpuri", "Vidisha"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Navi Mumbai", "Kolhapur", "Solapur", "Amravati", "Akola", "Nanded", "Latur", "Satara", "Sangli", "Jalgaon", "Ahmednagar", "Ratnagiri", "Chandrapur"],
  "Manipur": ["Imphal", "Thoubal", "Churachandpur", "Ukhrul", "Senapati", "Tamenglong", "Bishnupur", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar", "Nongstoin", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip", "Lawngtlai", "Saiha"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Mon", "Phek", "Zunheboto"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur", "Berhampur", "Balasore", "Baripada", "Jharsuguda", "Koraput", "Angul", "Dhenkanal", "Rayagada", "Bargarh"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Moga", "Firozpur", "Sangrur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bharatpur", "Sikar", "Bhilwara", "Sri Ganganagar", "Pali", "Barmer", "Jaisalmer", "Chittorgarh"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Ravangla", "Pelling"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Hosur", "Nagercoil", "Cuddalore", "Kanchipuram", "Karur", "Ooty"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Nalgonda", "Adilabad", "Mahbubnagar", "Siddipet", "Suryapet", "Mancherial", "Ramagundam"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Ambassa", "Belonia", "Khowai"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Ghaziabad", "Noida", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Mathura", "Ayodhya", "Jhansi", "Firozabad", "Saharanpur", "Muzaffarnagar", "Rampur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Haldwani", "Almora", "Mussoorie", "Roorkee", "Pithoragarh", "Chamoli", "Uttarkashi", "Rudraprayag", "Bageshwar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling", "Malda", "Kharagpur", "Haldia", "Jalpaiguri", "Bardhaman", "Cooch Behar", "Krishnanagar"],
  "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder", "Rangat"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Gulmarg", "Pahalgam", "Kupwara", "Kathua", "Udhampur", "Pulwama"],
  "Ladakh": ["Leh", "Kargil", "Nubra", "Drass"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Andrott", "Kalpeni", "Minicoy"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const headers = { 'User-Agent': 'DisasterGuard-AI-Seed/1.0 (contact@example.com)' };
  let results = [];
  for (const state of Object.keys(locations)) {
    for (const city of locations[state]) {
      try {
        console.log(`Fetching ${city}, ${state}...`);
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&country=India&format=json`, { headers });
        if (res.data && res.data.length > 0) {
          results.push({ stateName: state, name: city, lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) });
        } else {
          // fallback search
          const res2 = await axios.get(`https://nominatim.openstreetmap.org/search?q=${city},${state},India&format=json`, { headers });
          if (res2.data && res2.data.length > 0) {
             results.push({ stateName: state, name: city, lat: parseFloat(res2.data[0].lat), lng: parseFloat(res2.data[0].lon) });
          } else {
             console.log(`WARNING: Could not find ${city}, ${state}`);
             results.push({ stateName: state, name: city, lat: 20.0, lng: 79.0 });
          }
        }
      } catch (err) {
        console.error(`Error for ${city}:`, err.message);
        results.push({ stateName: state, name: city, lat: 20.0, lng: 79.0 });
      }
      await delay(1100);
    }
  }
  fs.writeFileSync('city_coords.json', JSON.stringify(results, null, 2));
  console.log('Done writing city_coords.json');
}

run();
