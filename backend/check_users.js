import { User } from './src/models/index.js';

async function checkUsers() {
    try {
        const users = await User.findAll({ attributes: ['id', 'email', 'role'] });
        console.log('Users in DB:');
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    process.exit();
}

checkUsers();
