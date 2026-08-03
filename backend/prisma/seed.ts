import { PrismaClient, SpaceType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create an Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fuoye.edu.ng' },
    update: {},
    create: {
      email: 'admin@fuoye.edu.ng',
      matricNumber: 'ADMIN001',
      fullName: 'System Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created');

  // 2. Create School Hostel
  const schoolHostel = await prisma.facility.upsert({
    where: { slug: 'school-hostel-a' },
    update: {},
    create: {
      name: 'School Hostel Block A',
      slug: 'school-hostel-a',
      type: SpaceType.SCHOOL_HOSTEL,
      description: 'Official university hostel for male students.',
      location: 'Main Campus',
      capacity: 200,
      price: 25000.00,
      amenities: ['Electricity', 'Water Supply', 'Security'],
      isActive: true,
      rooms: {
        create: [
          { roomNumber: 'A101', floor: 1, totalBeds: 4, availableBeds: 4, pricePerBed: 25000.00 },
          { roomNumber: 'A102', floor: 1, totalBeds: 4, availableBeds: 4, pricePerBed: 25000.00 },
          { roomNumber: 'A201', floor: 2, totalBeds: 4, availableBeds: 4, pricePerBed: 25000.00 },
        ],
      },
    },
  });
  console.log('School hostel created');

  // 3. Create Private Hostel
  const privateHostel = await prisma.facility.upsert({
    where: { slug: 'private-hostel-elite' },
    update: {},
    create: {
      name: 'Elite Private Hostel',
      slug: 'private-hostel-elite',
      type: SpaceType.PRIVATE_HOSTEL,
      description: 'Premium private hostel off-campus.',
      location: 'Oye-Ekiti Town',
      capacity: 100,
      price: 150000.00,
      amenities: ['Generator', 'WiFi', 'En-suite Bathroom', 'Security'],
      isActive: true,
      rooms: {
        create: [
          { roomNumber: 'E101', floor: 1, totalBeds: 1, availableBeds: 1, pricePerBed: 150000.00 },
          { roomNumber: 'E102', floor: 1, totalBeds: 2, availableBeds: 2, pricePerBed: 80000.00 },
        ],
      },
    },
  });
  console.log('Private hostel created');

  // 4. Create Classroom
  const classroom = await prisma.facility.upsert({
    where: { slug: 'science-lt1' },
    update: {},
    create: {
      name: 'Science Lecture Theater 1',
      slug: 'science-lt1',
      type: SpaceType.CLASSROOM,
      description: 'Large lecture theater for faculty of science.',
      location: 'Faculty of Science',
      capacity: 500,
      price: 0,
      amenities: ['Projector', 'PA System', 'Whiteboard'],
      isActive: true,
      rooms: {
        create: [
          { roomNumber: 'LT1', floor: 1, totalBeds: 0, availableBeds: 0 },
        ],
      },
    },
  });
  // 5. Create a Student User
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@fuoye.edu.ng' },
    update: {},
    create: {
      email: 'student@fuoye.edu.ng',
      matricNumber: 'CSC/2022/1045',
      fullName: 'John Doe',
      passwordHash: studentPassword,
      role: 'STUDENT',
    },
  });
  console.log('Student user created');

  // 6. Create Mock Bookings
  const lt1Room = await prisma.room.findFirst({
    where: { roomNumber: 'LT1' }
  });

  if (lt1Room) {
    await prisma.booking.createMany({
      data: [
        {
          userId: student.id,
          facilityId: classroom.id,
          roomId: lt1Room.id,
          purpose: 'CSC 301 Continuous Assessment Tutorial',
          startTime: new Date('2026-05-20T10:00:00Z'),
          endTime: new Date('2026-05-20T12:00:00Z'),
          status: 'CONFIRMED',
        },
        {
          userId: student.id,
          facilityId: classroom.id,
          roomId: lt1Room.id,
          purpose: 'Departmental Week Seminar',
          startTime: new Date('2026-05-17T14:00:00Z'),
          endTime: new Date('2026-05-17T17:00:00Z'),
          status: 'PENDING',
        }
      ],
      skipDuplicates: true,
    });
    console.log('Mock bookings created');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
