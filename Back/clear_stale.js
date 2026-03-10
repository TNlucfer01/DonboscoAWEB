// clear_stale.js
require('./src/config/env');
const { sequelize, User } = require('./src/models/index');
//why does this even need 
async function clear() {
    try {
        await sequelize.authenticate();
        console.log('✔ Authenticated');
        const deleted = await User.destroy({ where: { email: 'principal@donbosco.edu' } });
        console.log(`✔ Deleted ${deleted} stale entries`);
    } catch (err) {
        console.error('✘ Error:', err.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
clear();
