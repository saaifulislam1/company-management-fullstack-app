// scripts/hash-password.ts
import bcrypt from 'bcryptjs';

const hashPassword = async () => {
  // Get the password from the command line arguments
  const password = process.argv[2];

  if (!password) {
    console.error('❌ Please provide a password to hash.');
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('🔑 Hashed Password:', hashedPassword);
};

hashPassword();
