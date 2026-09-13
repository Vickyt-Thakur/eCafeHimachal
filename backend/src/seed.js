import './config/env.js';
import bcrypt from 'bcrypt';
import { connectDatabase } from './config/db.js';
import User from './models/User.js';
import Service from './models/Service.js';

const initialServices = [
  ['Bus Booking - All India', 99, 'ID & Travel'], ['Domestic PCC Apply Service', 399, 'ID & Travel'], ['Link Mobile Number with Ration Card', 99, 'Government Online Services'], ['Gulf Medical Application Service', 399, 'ID & Travel'], ['DSC Apply Service', 999, 'Business Services'], ['Bio Data Making - Sea Jobs', 499, 'Jobs & Employment'], ['Food Licence - New & Renewal', 999, 'Business Services'], ['Resume Making Service', 199, 'Jobs & Employment'], ['GST Registration', 1499, 'Business Services'], ['Ayushman Card Service', 199, 'Government Online Services'], ['ISO Apply Service', 1999, 'Business Services'], ['ABHA Card Apply Service', 99, 'Government Online Services'], ['ABC Card Apply Service', 99, 'Education'], ['Link Mobile Number with RC', 99, 'ID & Travel'], ['High Security Registration Plate (HSRP) - HP', 199, 'ID & Travel'], ['Passing Fee Service', 199, 'ID & Travel'], ['Him Access Card Service', 99, 'Government Online Services'], ['MV Tax / Road Tax / Green Tax Service', 299, 'ID & Travel'], ['EPFO Service', 499, 'Government Online Services'], ['APAAR Card Apply Service', 99, 'Education'], ['3rd Party Bike Insurance', 899, 'Insurance & Financial Services'], ['Learning Licence Apply', 399, 'ID & Travel'], ['School & College Admission', 199, 'Education'], ['HP Bus Conductor Licence Apply', 299, 'Jobs & Employment'], ['Voter Card Apply Service', 199, 'Government Online Services'], ['Tatkal Rail Booking', 299, 'ID & Travel'], ['Old Age Pension - HP', 99, 'Government Online Services'], ['Kedarnath Booking Service', 199, 'ID & Travel'], ['Learning Licence Renewal', 99, 'ID & Travel'], ['Hotel Booking - All India', 299, 'ID & Travel'], ['Trademark Apply', 4999, 'Business Services'], ['International Air Booking', 399, 'ID & Travel'], ['DEB ID Apply Service', 99, 'Education'], ['Passport Service', 2999, 'ID & Travel'], ['Rail Booking - All India', 199, 'ID & Travel'], ['HimCare Card - New & Renewal', 1099, 'Government Online Services'], ['School & College Scholarship Apply Service', 199, 'Education'], ['ITR Service - Income Tax Return Filing', 499, 'Insurance & Financial Services'], ['e-Shram Card Service', 199, 'Government Online Services'], ['International PCC Apply Service', 999, 'ID & Travel'], ['MSME Certificate', 499, 'Business Services'], ['Third Party Motor Insurance / Car Insurance', 2499, 'Insurance & Financial Services'], ['Bio Data Making Service', 199, 'Typing & Documents'], ['Link Mobile Number with Driving Licence', 99, 'ID & Travel'], ['Cricket Stadium Ticket Booking Service', 199, 'ID & Travel'], ['Employment Exchange Registration', 199, 'Jobs & Employment'], ['IEC Code Apply', 1999, 'Business Services'], ['Check Post Tax - Apply Online', 199, 'Government Online Services'], ['Shop Registration Service', 199, 'Business Services'], ['HP Senior Citizens Card Apply', 199, 'Government Online Services'], ['Dubai Tourist Visa', 999, 'ID & Travel'], ['GeM Registration', 499, 'Business Services'], ['PAN Card Service', 299, 'ID & Travel'], ['Aadhaar-PAN Link Service', 1099, 'ID & Travel'],
];

async function seedAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before seeding.');
  await connectDatabase();
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email },
    { name: 'eCafeHimachal Admin', email, mobile: '9000000000', passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Service.updateMany({ name: { $nin: initialServices.map(([name]) => name) } }, { $set: { isActive: false } });
  await Promise.all(initialServices.map(([name, price, category]) => Service.updateOne({ name }, { $set: { name, description: `${category} assistance`, category, customerPrice: price, partnerPrice: price, icon: 'FileText', isActive: true } }, { upsert: true })));
  console.log(`Admin account is ready for ${email}`);
  console.log(`${initialServices.length} official services are ready.`);
  process.exit(0);
}

seedAdmin().catch((error) => { console.error('Admin seed failed:', error.message); process.exit(1); });
