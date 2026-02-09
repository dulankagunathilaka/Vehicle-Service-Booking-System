const mongoose = require('mongoose');
require('dotenv').config();

const Service = require('./src/models/Service');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoserve';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedServices = async () => {
  const services = [
    {
      name: 'Oil Change',
      description: 'Complete oil change with filter replacement and fluid check',
      category: 'maintenance',
      price: 45,
      duration: 30,
      isAvailable: true,
    },
    {
      name: 'Tire Rotation',
      description: 'Professional tire rotation and balance service',
      category: 'maintenance',
      price: 60,
      duration: 45,
      isAvailable: true,
    },
    {
      name: 'Brake Service',
      description: 'Complete brake inspection, pad replacement, and system check',
      category: 'repair',
      price: 150,
      duration: 90,
      isAvailable: true,
    },
    {
      name: 'Engine Diagnostic',
      description: 'Comprehensive engine diagnostic and computer scan',
      category: 'inspection',
      price: 80,
      duration: 60,
      isAvailable: true,
    },
    {
      name: 'Battery Replacement',
      description: 'Battery test and replacement service with installation',
      category: 'repair',
      price: 120,
      duration: 30,
      isAvailable: true,
    },
    {
      name: 'Air Filter Replacement',
      description: 'Engine air filter and cabin air filter replacement',
      category: 'maintenance',
      price: 35,
      duration: 20,
      isAvailable: true,
    },
    {
      name: 'Vehicle Inspection',
      description: 'Complete 50-point vehicle inspection and report',
      category: 'inspection',
      price: 100,
      duration: 60,
      isAvailable: true,
    },
    {
      name: 'Interior Detailing',
      description: 'Professional interior cleaning, vacuuming, and conditioning',
      category: 'customization',
      price: 75,
      duration: 90,
      isAvailable: true,
    },
    {
      name: 'Exterior Detailing',
      description: 'Complete exterior wash, wax, and polish service',
      category: 'customization',
      price: 100,
      duration: 120,
      isAvailable: true,
    },
    {
      name: 'Transmission Service',
      description: 'Transmission fluid change and filter replacement',
      category: 'repair',
      price: 200,
      duration: 120,
      isAvailable: true,
    },
  ];

  try {
    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    const createdServices = await Service.insertMany(services);
    console.log(`Successfully created ${createdServices.length} services:`);
    createdServices.forEach((service) => {
      console.log(`  - ${service.name} ($${service.price})`);
    });
  } catch (error) {
    console.error('Error seeding services:', error.message);
  }
};

const main = async () => {
  await connectDB();
  await seedServices();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

main();
