// backend/seed.js
// Database seeding script to populate initial Admin, 3 Doctors, and Sample Time Slots

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Slot = require('./models/Slot');
const Appointment = require('./models/Appointment');

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 2. Clear existing collections to start fresh
    console.log('Clearing old collections...');
    await Appointment.deleteMany({});
    await Slot.deleteMany({});
    await Doctor.deleteMany({});
    await User.deleteMany({});

    // 3. Create Admin user
    console.log('Creating Admin account...');
    const adminUser = await User.create({
      name: 'Hospital Admin',
      email: 'admin@hospital.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    // 4. Create Sample Patient for quick testing
    console.log('Creating Sample Patient account...');
    const patientUser = await User.create({
      name: 'John Patient',
      email: 'patient@hospital.com',
      password: 'patientpassword123',
      role: 'patient'
    });

    // 5. Create 3 Doctors
    console.log('Creating 3 Doctor accounts & profiles...');
    const doctorAccounts = [
      {
        name: 'Dr. Sarah Connor',
        email: 'sarah.connor@hospital.com',
        password: 'doctorpassword123',
        specialty: 'Cardiology',
        experience: 12,
        consultationFee: 120
      },
      {
        name: 'Dr. Gregory House',
        email: 'gregory.house@hospital.com',
        password: 'doctorpassword123',
        specialty: 'Neurology',
        experience: 16,
        consultationFee: 150
      },
      {
        name: 'Dr. Meredith Grey',
        email: 'meredith.grey@hospital.com',
        password: 'doctorpassword123',
        specialty: 'Pediatrics',
        experience: 9,
        consultationFee: 95
      }
    ];

    const createdDoctors = [];
    for (const doc of doctorAccounts) {
      // Create user credential
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: doc.password,
        role: 'doctor'
      });

      // Create linked doctor profile
      const doctor = await Doctor.create({
        user: user._id,
        name: doc.name,
        email: doc.email,
        specialty: doc.specialty,
        experience: doc.experience,
        consultationFee: doc.consultationFee
      });

      createdDoctors.push(doctor);
    }

    // 6. Generate Sample Time Slots for upcoming days
    console.log('Creating sample availability slots for each doctor...');
    // Helper to format date as YYYY-MM-DD
    const formatDate = (daysAhead) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const slotTimes = [
      { startTime: '09:00', endTime: '09:30' },
      { startTime: '10:00', endTime: '10:30' },
      { startTime: '11:00', endTime: '11:30' },
      { startTime: '14:00', endTime: '14:30' },
      { startTime: '15:00', endTime: '15:30' },
      { startTime: '16:00', endTime: '16:30' }
    ];

    let totalSlotsCreated = 0;
    // For each doctor, add slots for today (day 0), tomorrow (day 1), and day after (day 2)
    for (const doctor of createdDoctors) {
      for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
        const slotDate = formatDate(dayOffset);
        for (const time of slotTimes) {
          await Slot.create({
            doctor: doctor._id,
            date: slotDate,
            startTime: time.startTime,
            endTime: time.endTime,
            status: 'available'
          });
          totalSlotsCreated++;
        }
      }
    }

    console.log('========================================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('--------------------------------------------------------');
    console.log('Admin Login:');
    console.log('  Email: admin@hospital.com');
    console.log('  Password: adminpassword123');
    console.log('--------------------------------------------------------');
    console.log('Doctor Logins (3 Doctors created):');
    console.log('  1) sarah.connor@hospital.com | doctorpassword123 (Cardiology)');
    console.log('  2) gregory.house@hospital.com | doctorpassword123 (Neurology)');
    console.log('  3) meredith.grey@hospital.com | doctorpassword123 (Pediatrics)');
    console.log('--------------------------------------------------------');
    console.log('Patient Login (Self-registered sample):');
    console.log('  Email: patient@hospital.com');
    console.log('  Password: patientpassword123');
    console.log('--------------------------------------------------------');
    console.log(`Total Slots Created: ${totalSlotsCreated}`);
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
