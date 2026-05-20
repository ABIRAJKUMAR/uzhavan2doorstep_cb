import sequelize from './src/config/db.js';

async function enableRLS() {
  try {
    console.log('Connecting to database to enable Row Level Security (RLS)...');
    
    const tables = ['Users', 'Products', 'Orders', 'MarketPrices', 'Reviews'];
    
    for (const table of tables) {
      console.log(`Enabling RLS on table "${table}"...`);
      await sequelize.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`RLS enabled successfully on table "${table}".`);
    }
    
    console.log('\nAll Row Level Security (RLS) operations completed successfully.');
  } catch (error) {
    console.error('Error executing SQL command:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

enableRLS();
