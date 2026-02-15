import bcrypt from 'bcrypt';

const adminPassword = 'Neon@2025Server!';

bcrypt.hash(adminPassword, 10).then(hash => {
  console.log("✅ BCRYPT HASH:", hash);
}).catch(err => {
  console.error("❌ Error hashing password:", err);
});
