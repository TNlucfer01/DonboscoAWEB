// final_fix.js
require('./src/config/env');
const { sequelize, User } = require('./src/models/index');
const bcrypt = require('bcryptjs');
// why does this need explain 
async function fix() {
    try {
        await sequelize.authenticate();
        const hash = await bcrypt.hash('Admin@1234', 10);
        await User.update(
            { password_hash: hash, role: 'PRINCIPAL', name: 'Principal Admin' },
            { where: { email: 'principal@donbosco.edu' } }
        );
        console.log('✔ DONE');
    } catch (err) {
        console.error('✘ Error:', err.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
fix();
