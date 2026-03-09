import pool from './connection.js';

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('TRUNCATE TABLE notifications CASCADE');
    await client.query('TRUNCATE TABLE transactions CASCADE');
    await client.query('TRUNCATE TABLE cards CASCADE');
    await client.query('TRUNCATE TABLE balances CASCADE');
    await client.query('TRUNCATE TABLE wallets CASCADE');
    await client.query('TRUNCATE TABLE sessions CASCADE');
    await client.query('TRUNCATE TABLE otps CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    await client.query('TRUNCATE TABLE promotions CASCADE');
    await client.query('TRUNCATE TABLE topup_packages CASCADE');

    console.log('Seeding users...');
    const userResult = await client.query(`
      INSERT INTO users (phone, first_name, last_name, avatar_url) 
      VALUES ($1, $2, $3, $4)
      RETURNING id, phone, first_name, last_name
    `, ['27689053667', 'George', 'Sambara', 'https://d64gsuwffb70l.cloudfront.net/69ad864f844bf0dd01fa9f1d_1772979841438_404b4cde.png']);

    const userId = userResult.rows[0].id;
    console.log(`Created user: ${userResult.rows[0].phone}`);

    // Create wallet
    console.log('Creating wallet...');
    await client.query(
      'INSERT INTO wallets (user_id, balance, currency) VALUES ($1, $2, $3)',
      [userId, 45.10, 'ZAR']
    );

    // Create balances
    console.log('Creating balances...');
    const balances = [
      { type: 'airtime', value: 6.00, unit: 'ZAR' },
      { type: 'data', value: 259, unit: 'MB' },
      { type: 'minutes', value: 12, unit: 'min' },
      { type: 'sms', value: 8, unit: 'SMS' },
    ];

    for (const balance of balances) {
      await client.query(
        'INSERT INTO balances (user_id, type, value, unit) VALUES ($1, $2, $3, $4)',
        [userId, balance.type, balance.value, balance.unit]
      );
    }

    // Seed top-up packages
    console.log('Seeding top-up packages...');
    const packages = [
      { type: 'data', name: '1GB Data', price: 49.99, amount: 1024, unit: 'MB', validity: 30 },
      { type: 'data', name: '5GB Data', price: 99.99, amount: 5120, unit: 'MB', validity: 30 },
      { type: 'voice', name: '60 Minutes', price: 39.99, amount: 60, unit: 'min', validity: 30 },
      { type: 'voice', name: '300 Minutes', price: 149.99, amount: 300, unit: 'min', validity: 30 },
      { type: 'sms', name: '100 SMS', price: 29.99, amount: 100, unit: 'SMS', validity: 30 },
      { type: 'airtime', name: 'R10 Airtime', price: 10.00, amount: 10, unit: 'ZAR', validity: 30 },
      { type: 'airtime', name: 'R50 Airtime', price: 50.00, amount: 50, unit: 'ZAR', validity: 30 },
    ];

    for (const pkg of packages) {
      await client.query(
        `INSERT INTO topup_packages (type, name, description, price, amount, unit, validity_days, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [pkg.type, pkg.name, '', pkg.price, pkg.amount, pkg.unit, pkg.validity, true]
      );
    }

    // Seed promotions
    console.log('Seeding promotions...');
    const promotions = [
      {
        title: 'Double Data Weekend',
        description: 'Get double data on all bundles this weekend! Limited offer.',
        discount: 50,
      },
      {
        title: 'Welcome Bonus',
        description: 'Receive R5 airtime as a welcome bonus!',
        discount: 0,
      },
      {
        title: 'Bundle Saver',
        description: 'Save up to 20% on combo bundle purchases',
        discount: 20,
      },
    ];

    for (const promo of promotions) {
      await client.query(
        `INSERT INTO promotions (title, description, discount_percent, active)
         VALUES ($1, $2, $3, $4)`,
        [promo.title, promo.description, promo.discount, true]
      );
    }

    // Add some sample notifications
    console.log('Adding sample notifications...');
    const notifications = [
      {
        title: 'Data Bundle Expiring',
        message: 'Your 1GB data bundle expires in 2 days. Top up now to stay connected.',
        type: 'alert',
      },
      {
        title: 'Payment Successful',
        message: 'Your R50.00 wallet deposit was successful.',
        type: 'success',
      },
      {
        title: 'New Promotion',
        message: 'Get double data on all bundles this weekend! Limited offer.',
        type: 'promotion',
      },
    ];

    for (const notif of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)`,
        [userId, notif.title, notif.message, notif.type]
      );
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

seedDatabase().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
