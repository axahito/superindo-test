import bcrypt from 'bcrypt';

const saltRounds = 10; // Number of salt rounds for hashing

// Hash a password
const password = 'abc123';
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Hashed password:', hash);
});