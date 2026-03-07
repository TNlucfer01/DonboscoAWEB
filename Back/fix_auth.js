// fix_auth.js — Reset principal password
require('./src/config/env');
const { sequelize, User } = require('./src/models/index');
const bcrypt = require('bcryptjs');

async function fix() {
    try {
        await sequelize.authenticate();
        const hash = await bcrypt.hash('Admin@1234', 10);

        // Find by email or role
        let user = await User.findOne({ where: { email: 'principal@donbosco.edu' } });

        if (user) {
            await user.update({ password_hash: hash, role: 'PRINCIPAL', name: 'Principal Admin' });
            console.log('✔ Password for principal@donbosco.edu has been reset to: Admin@1234');
        } else {
            await User.create({
                name: 'Principal Admin',
                email: 'principal@donbosco.edu',
                phone_number: '9000000000',
                role: 'PRINCIPAL',
                password_hash: hash
            });
            console.log('✔ Principal account created with password: Admin@1234');
        }
    } catch (err) {
        console.error('✘ Error:', err.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

fix();
