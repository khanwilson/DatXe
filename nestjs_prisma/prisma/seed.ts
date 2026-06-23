import { Customer, Driver, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { user_name: 'admin' },
    update: {},
    create: {
      user_name: 'admin',
      password_hash: passwordHash,
      role: 'ADMIN',
      phone: '0900000000',
      status: 'ACTIVE',
    },
  });
  console.log(`Created admin: ${admin.user_name}`);

  // Customer users + Customer records
  const customerData = [
    { userName: 'customer1', fullName: 'Nguyen Van An', phone: '0911111111' },
    { userName: 'customer2', fullName: 'Tran Thi Bich', phone: '0922222222' },
    { userName: 'customer3', fullName: 'Le Van Cuong', phone: '0933333333' },
  ];

  const customers: Customer[] = [];
  for (const data of customerData) {
    const user = await prisma.user.upsert({
      where: { user_name: data.userName },
      update: {},
      create: {
        user_name: data.userName,
        password_hash: passwordHash,
        role: 'CUSTOMER',
        phone: data.phone,
        status: 'ACTIVE',
      },
    });

    const customer = await prisma.customer.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        full_name: data.fullName,
        phone: data.phone,
      },
    });
    customers.push(customer);
    console.log(`Created customer: ${customer.full_name}`);
  }

  // Driver users + Driver records + Vehicles
  const driverData = [
    {
      userName: 'driver1',
      fullName: 'Pham Van Dat',
      phone: '0944444444',
      licenseNumber: 'LA-123456',
      vehicle: {
        licensePlate: '51F-123.45',
        brand: 'Toyota',
        model: 'Vios',
        color: 'White',
        type: 'CAR' as const,
        capacity: 4,
      },
    },
    {
      userName: 'driver2',
      fullName: 'Hoang Van Em',
      phone: '0955555555',
      licenseNumber: 'LA-654321',
      vehicle: {
        licensePlate: '59N1-987.65',
        brand: 'Honda',
        model: 'Wave Alpha',
        color: 'Red',
        type: 'MOTORBIKE' as const,
        capacity: 1,
      },
    },
  ];

  const drivers: Driver[] = [];
  for (const data of driverData) {
    const user = await prisma.user.upsert({
      where: { user_name: data.userName },
      update: {},
      create: {
        user_name: data.userName,
        password_hash: passwordHash,
        role: 'DRIVER',
        phone: data.phone,
        status: 'ACTIVE',
      },
    });

    const driver = await prisma.driver.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        full_name: data.fullName,
        phone: data.phone,
        license_number: data.licenseNumber,
        is_online: false,
        status: 'OFFLINE',
      },
    });

    await prisma.vehicle.upsert({
      where: { license_plate: data.vehicle.licensePlate },
      update: {},
      create: {
        driver_id: driver.id,
        license_plate: data.vehicle.licensePlate,
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        color: data.vehicle.color,
        type: data.vehicle.type,
        capacity: data.vehicle.capacity,
      },
    });

    drivers.push(driver);
    console.log(`Created driver: ${driver.full_name} with vehicle ${data.vehicle.licensePlate}`);
  }

  // Refresh drivers to get vehicle_id
  const driver1 = await prisma.driver.findUnique({ where: { user_id: (await prisma.user.findUniqueOrThrow({ where: { user_name: 'driver1' } })).id }, include: { vehicle: true } });
  const driver2 = await prisma.driver.findUnique({ where: { user_id: (await prisma.user.findUniqueOrThrow({ where: { user_name: 'driver2' } })).id }, include: { vehicle: true } });

  // Sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      customer_id: customers[0].id,
      driver_id: driver1!.id,
      status: 'COMPLETED',
      pickup_lat: 10.7769,
      pickup_lng: 106.7009,
      pickup_address: '1 Nguyen Hue, District 1, HCMC',
      dropoff_lat: 10.7623,
      dropoff_lng: 106.6911,
      dropoff_address: '220 Nguyen Thi Minh Khai, District 3, HCMC',
      distance: 2.5,
      estimated_price: 50000,
      final_price: 55000,
      estimated_duration: 15,
      actual_distance: 2.7,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      customer_id: customers[1].id,
      driver_id: driver2!.id,
      status: 'IN_PROGRESS',
      pickup_lat: 10.7802,
      pickup_lng: 106.6988,
      pickup_address: '100 Le Loi, District 1, HCMC',
      dropoff_lat: 10.7544,
      dropoff_lng: 106.7023,
      dropoff_address: '50 Pasteur, District 1, HCMC',
      distance: 3.1,
      estimated_price: 35000,
      estimated_duration: 12,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      customer_id: customers[2].id,
      status: 'PENDING',
      pickup_lat: 10.7688,
      pickup_lng: 106.7075,
      pickup_address: '500 Dien Bien Phu, Binh Thanh, HCMC',
      dropoff_lat: 10.7756,
      dropoff_lng: 106.6950,
      dropoff_address: '30 Nguyen Du, District 1, HCMC',
      distance: 2.0,
      estimated_price: 40000,
      estimated_duration: 10,
    },
  });
  console.log(`Created ${3} bookings`);

  // Trips
  await prisma.trip.create({
    data: {
      booking_id: booking1.id,
      driver_id: driver1!.id,
      customer_id: customers[0].id,
      status: 'COMPLETED',
      pickup_lat: 10.7769,
      pickup_lng: 106.7009,
      dropoff_lat: 10.7623,
      dropoff_lng: 106.6911,
      route_polyline: 'enc_sample_polyline_1',
      actual_distance: 2.7,
      actual_duration: 18,
      started_at: new Date(Date.now() - 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 42 * 60 * 1000),
    },
  });

  await prisma.trip.create({
    data: {
      booking_id: booking2.id,
      driver_id: driver2!.id,
      customer_id: customers[1].id,
      status: 'IN_PROGRESS',
      pickup_lat: 10.7802,
      pickup_lng: 106.6988,
      dropoff_lat: 10.7544,
      dropoff_lng: 106.7023,
      route_polyline: 'enc_sample_polyline_2',
      started_at: new Date(Date.now() - 5 * 60 * 1000),
    },
  });
  console.log(`Created 2 trips`);

  // Payments
  await prisma.payment.create({
    data: {
      booking_id: booking1.id,
      amount: 55000,
      method: 'CASH',
      status: 'SUCCESSFUL',
      paid_at: new Date(Date.now() - 42 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      booking_id: booking2.id,
      amount: 35000,
      method: 'CARD',
      status: 'PENDING',
    },
  });
  console.log(`Created 2 payments`);

  // Dispatch offers
  await prisma.dispatchOffer.create({
    data: {
      booking_id: booking2.id,
      driver_id: driver1!.id,
      status: 'REJECTED',
      expired_at: new Date(Date.now() - 20 * 60 * 1000),
      responded_at: new Date(Date.now() - 19 * 60 * 1000),
    },
  });

  await prisma.dispatchOffer.create({
    data: {
      booking_id: booking2.id,
      driver_id: driver2!.id,
      status: 'ACCEPTED',
      expired_at: new Date(Date.now() + 10 * 60 * 1000),
      responded_at: new Date(Date.now() - 15 * 60 * 1000),
    },
  });

  await prisma.dispatchOffer.create({
    data: {
      booking_id: booking3.id,
      driver_id: driver1!.id,
      status: 'PENDING',
      expired_at: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
  console.log(`Created 3 dispatch offers`);

  // Audit logs
  await prisma.auditLog.create({
    data: {
      entity_type: 'Booking',
      entity_id: booking1.id,
      action: 'STATUS_CHANGED',
      old_values: { status: 'PENDING' },
      new_values: { status: 'COMPLETED' },
      changed_by_id: driver1!.user_id,
    },
  });

  await prisma.auditLog.create({
    data: {
      entity_type: 'Booking',
      entity_id: booking2.id,
      action: 'STATUS_CHANGED',
      old_values: { status: 'PENDING' },
      new_values: { status: 'IN_PROGRESS' },
      changed_by_id: driver2!.user_id,
    },
  });
  console.log(`Created 2 audit logs`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
