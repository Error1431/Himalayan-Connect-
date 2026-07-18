const users = [];
const products = [];
const homestays = [];

let userId = 1;
let productId = 1;
let homestayId = 1;

function nextUserId() {
  return userId++;
}

function nextProductId() {
  return productId++;
}

function nextHomestayId() {
  return homestayId++;
}

function seedData() {
  if (products.length === 0) {
    products.push(
      {
        _id: String(nextProductId()),
        farmer: 0,
        productName: 'Organic Kedarnath Rajma',
        category: 'Pulses',
        description: 'Hand-picked organic rajma grown in the Kedarnath valley.',
        basePrice: 180,
        unit: 'kg',
        quantity: 50,
        locationAddress: 'Kedarnath Valley, 7000ft',
        locationLat: 30.7282,
        locationLng: 78.9826,
        locationZipCode: '246439',
        imageUrl: '',
        ratings: { average: 4.5, count: 23 },
        createdAt: new Date().toISOString(),
      },
      {
        _id: String(nextProductId()),
        farmer: 0,
        productName: 'Himalayan Mandua (Finger Millet)',
        category: 'Millets',
        description: 'Stone-ground finger millet from the Garhwal highlands.',
        basePrice: 120,
        unit: 'kg',
        quantity: 80,
        locationAddress: 'Garhwal Highlands',
        locationLat: 30.4,
        locationLng: 79.1,
        locationZipCode: '246001',
        imageUrl: '',
        ratings: { average: 4.8, count: 45 },
        createdAt: new Date().toISOString(),
      }
    );
  }

  if (homestays.length === 0) {
    homestays.push(
      {
        _id: String(nextHomestayId()),
        owner: 0,
        homestayName: 'Trishul View Cottage',
        slug: 'trishul-view-cottage',
        village: 'Sari',
        district: 'Rudraprayag',
        price: 1800,
        type: 'budget',
        tags: ['Organic Food', 'Trekking', 'Mountain View'],
        image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
        rating: 4.7,
        reviews: 89,
        createdAt: new Date().toISOString(),
      },
      {
        _id: String(nextHomestayId()),
        owner: 0,
        homestayName: 'Chopta Meadows Homestay',
        slug: 'chopta-meadows',
        village: 'Chopta',
        district: 'Rudraprayag',
        price: 2500,
        type: 'premium',
        tags: ['Best View', 'WiFi', 'Farm-to-Table'],
        image: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=600&q=80',
        rating: 4.8,
        reviews: 124,
        createdAt: new Date().toISOString(),
      }
    );
  }
}

module.exports = {
  users,
  products,
  homestays,
  nextUserId,
  nextProductId,
  nextHomestayId,
  seedData,
};
