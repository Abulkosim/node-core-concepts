const fs = require('fs').promises;

async function loadUserData(userId) {
  try {
    const data = await fs.readFile(`users/${userId}.json`, 'utf8');
    const user = JSON.parse(data);

    if (!user.email) {
      throw new Error('Invalid user data: missing email');
    }

    return user;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`User ${userId} not found`);
    } else if (error instanceof SyntaxError) {
      throw new Error('Invalid user data format');
    }
    throw error;
  } finally {
    console.log(`Finished processing user ${userId}`);
  }
}

(async () => {
  try {
    const user = await loadUserData(123);
    console.log('User loaded:', user);
  } catch (error) {
    console.error('Failed to load user:', error.message);
  }
})();