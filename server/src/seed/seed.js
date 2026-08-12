/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Salon = require('../models/Salon');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const { generateDaySlots, dateToDayKey } = require('../utils/slotGenerator');

const DEFAULT_HOURS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day) => ({
  day,
  isOpen: true,
  open: '09:00',
  close: '20:00',
}));
DEFAULT_HOURS.push({ day: 'sun', isOpen: false, open: '09:00', close: '18:00' });

const destroy = async () => {
  await Promise.all([
    User.deleteMany(),
    Salon.deleteMany(),
    Barber.deleteMany(),
    Service.deleteMany(),
    TimeSlot.deleteMany(),
    Booking.deleteMany(),
    Review.deleteMany(),
    Coupon.deleteMany(),
  ]);
  console.log('All collections cleared.');
};

const seed = async () => {
  await destroy();

  // ---- Users ----
  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@fadeconnect.app',
    password: 'admin123',
    role: 'admin',
    phone: '9999900000',
  });

  const owners = await User.create([
    { name: 'Arjun Mehta', email: 'owner1@fadeconnect.app', password: 'owner123', role: 'owner', phone: '9876500001' },
    { name: 'Priya Nair', email: 'owner2@fadeconnect.app', password: 'owner123', role: 'owner', phone: '9876500002' },
    { name: 'Karan Bhatt', email: 'owner3@fadeconnect.app', password: 'owner123', role: 'owner', phone: '9876500003' },
  ]);

  const customers = await User.create([
    { name: 'Rohan Sharma', email: 'customer1@fadeconnect.app', password: 'customer123', role: 'customer', phone: '9876511001' },
    { name: 'Ananya Iyer', email: 'customer2@fadeconnect.app', password: 'customer123', role: 'customer', phone: '9876511002' },
    { name: 'Vikram Rao', email: 'customer3@fadeconnect.app', password: 'customer123', role: 'customer', phone: '9876511003' },
  ]);

  console.log(`Created ${1 + owners.length + customers.length} users.`);

  // ---- Salons ----
  const salonDefs = [
    {
      owner: owners[0]._id,
      name: 'The Gentlemen\'s Parlour',
      description:
        'A premium grooming lounge in the heart of Banjara Hills, blending classic barbering craft with modern styling.',
      location: {
        address: 'Road No. 12, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
        lat: 17.4126,
        lng: 78.4482,
      },
      contact: { phone: '040-23456789', email: 'contact@gentlemensparlour.in' },
      priceLevel: 3,
      amenities: ['Free WiFi', 'AC', 'Complimentary Beverages', 'Parking'],
    },
    {
      owner: owners[1]._id,
      name: 'Urban Fade Studio',
      description: 'Fast, sharp fades and beard sculpting for the modern professional. Walk-ins welcome, bookings preferred.',
      location: {
        address: 'Jubilee Hills Check Post',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        lat: 17.4239,
        lng: 78.4738,
      },
      contact: { phone: '040-23411223', email: 'hello@urbanfade.in' },
      priceLevel: 2,
      amenities: ['Free WiFi', 'AC', 'Kids Friendly'],
    },
    {
      owner: owners[2]._id,
      name: 'Royal Cuts & Spa',
      description: 'Luxury hair spa, coloring, and grooming experience with award-winning stylists.',
      location: {
        address: 'Kondapur Main Road',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500084',
        lat: 17.4614,
        lng: 78.3624,
      },
      contact: { phone: '040-23988776', email: 'book@royalcuts.in' },
      priceLevel: 4,
      amenities: ['Free WiFi', 'AC', 'Valet Parking', 'Premium Products'],
    },
  ];

  const salons = [];
  for (const def of salonDefs) {
    const salon = await Salon.create({
      ...def,
      businessHours: DEFAULT_HOURS,
      status: 'approved',
      images: [],
    });
    salons.push(salon);
  }
  console.log(`Created ${salons.length} salons.`);

  // ---- Services per salon ----
  const serviceTemplate = [
    { name: 'Classic Hair Cut', category: 'Hair Cut', price: 350, durationMinutes: 30, description: 'Precision cut tailored to your face shape.' },
    { name: 'Beard Trim & Shape', category: 'Beard Trim', price: 200, durationMinutes: 20, description: 'Sharp lines, clean fade into the cut.' },
    { name: 'Hair Spa Therapy', category: 'Hair Spa', price: 900, durationMinutes: 60, description: 'Deep conditioning and scalp massage.' },
    { name: 'Global Hair Coloring', category: 'Hair Coloring', price: 1800, durationMinutes: 90, description: 'Full coverage colour with premium ammonia-free dyes.' },
    { name: 'Classic Facial', category: 'Facial', price: 700, durationMinutes: 45, description: 'Deep cleanse, exfoliation, and hydration.' },
    { name: 'Traditional Shave', category: 'Shaving', price: 150, durationMinutes: 15, description: 'Hot towel straight-razor shave.' },
  ];

  const servicesBySalon = {};
  for (const salon of salons) {
    const created = await Service.create(
      serviceTemplate.map((s) => ({ ...s, salon: salon._id }))
    );
    servicesBySalon[salon._id] = created;
  }
  console.log('Created services for each salon.');

  // ---- Barbers per salon ----
  const barberNamePool = [
    ['Suresh Kumar', ['Fades', 'Classic Cuts'], 6],
    ['Imran Khan', ['Beard Styling', 'Hot Towel Shave'], 8],
    ['David Fernandes', ['Coloring', 'Hair Spa'], 5],
    ['Aditya Verma', ['Kids Cuts', 'Trendy Fades'], 3],
  ];

  const barbersBySalon = {};
  for (const salon of salons) {
    const created = await Barber.create(
      barberNamePool.map(([name, specialties, experienceYears]) => ({
        salon: salon._id,
        name,
        specialties,
        experienceYears,
        bio: `${name} brings ${experienceYears} years of grooming expertise to every chair.`,
        workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        services: servicesBySalon[salon._id].map((s) => s._id),
      }))
    );
    barbersBySalon[salon._id] = created;
  }
  console.log('Created barbers for each salon.');

  // ---- Time slots for the next 7 days ----
  let slotDocs = [];
  const today = new Date();
  for (const salon of salons) {
    for (const barber of barbersBySalon[salon._id]) {
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayKey = dateToDayKey(d);
        const hours = salon.businessHours.find((h) => h.day === dayKey);
        if (!hours || !hours.isOpen) continue;

        const windows = generateDaySlots({ open: hours.open, close: hours.close, durationMinutes: 30 });
        windows.forEach((w) => {
          slotDocs.push({
            salon: salon._id,
            barber: barber._id,
            date: dateStr,
            startTime: w.startTime,
            endTime: w.endTime,
          });
        });
      }
    }
  }
  await TimeSlot.insertMany(slotDocs, { ordered: false }).catch(() => {});
  console.log(`Generated ${slotDocs.length} time slots across all salons/barbers for the next 7 days.`);

  // ---- Sample past bookings + reviews (for the first salon) ----
  const salon = salons[0];
  const barber = barbersBySalon[salon._id][0];
  const service = servicesBySalon[salon._id][0];
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);
  const pastDateStr = pastDate.toISOString().slice(0, 10);

  const pastSlot = await TimeSlot.findOneAndUpdate(
    { barber: barber._id, date: { $lt: new Date().toISOString().slice(0, 10) } },
    {},
    { sort: { date: -1 } }
  );

  const completedBooking = await Booking.create({
    customer: customers[0]._id,
    salon: salon._id,
    barber: barber._id,
    service: service._id,
    timeSlot: pastSlot?._id || (await TimeSlot.findOne({ barber: barber._id }))._id,
    date: pastDateStr,
    startTime: '11:00',
    endTime: '11:30',
    priceAtBooking: service.price,
    status: 'completed',
    paymentStatus: 'paid',
    reviewed: true,
  });

  await Review.create({
    customer: customers[0]._id,
    salon: salon._id,
    booking: completedBooking._id,
    barber: barber._id,
    rating: 5,
    comment: 'Best fade I have gotten in Hyderabad. Suresh really knows his craft!',
  });

  await Salon.findByIdAndUpdate(salon._id, { ratingAverage: 5, ratingCount: 1 });

  // ---- Coupons ----
  await Coupon.create([
    {
      code: 'WELCOME20',
      description: '20% off your first booking',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 200,
      minBookingAmount: 300,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
    },
    {
      code: 'FLAT100',
      description: 'Flat ₹100 off on bookings above ₹500',
      discountType: 'flat',
      discountValue: 100,
      minBookingAmount: 500,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
    },
  ]);

  console.log('Seed complete.');
  console.log('\n--- Sample login credentials ---');
  console.log('Admin:     admin@fadeconnect.app / admin123');
  console.log('Owner:     owner1@fadeconnect.app / owner123  (The Gentlemen\'s Parlour)');
  console.log('Customer:  customer1@fadeconnect.app / customer123');
  console.log('---------------------------------\n');
};

const run = async () => {
  await connectDB();
  if (process.argv.includes('--destroy')) {
    await destroy();
  } else {
    await seed();
  }
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
