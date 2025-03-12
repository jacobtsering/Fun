// admin_company_reset_with_instructions.js
// Script to reset all users and companies, and create specific admin IDs with their own companies

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// List of admin IDs to create
const adminIds = [
  'HAROLD',
  'DYLAN',
  'TALI',
  'OWEN',
  'TYLER',
  'YASH',
  'MATTHEW',
  'CADEN',
  'KALLAN',
  'JACOB',
  'BCMP',
  'DEMO'
];

async function resetAndCreateAdminsWithCompanies() {
  try {
    console.log('Starting admin and company reset process...');
    
    // Step 1: Delete all existing users
    console.log('Deleting all existing users...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users`);
    
    // Step 2: Delete all existing companies
    console.log('Deleting all existing companies...');
    const deletedCompanies = await prisma.company.deleteMany({});
    console.log(`Deleted ${deletedCompanies.count} companies`);
    
    // Step 3: Create new companies and admin users
    console.log('Creating new companies and admin users...');
    
    for (const badgeId of adminIds) {
      // Create a company for this admin
      const company = await prisma.company.create({
        data: {
          name: `${badgeId} Company`,
        }
      });
      
      // Create admin user for this company
      await prisma.user.create({
        data: {
          badgeId: badgeId,
          name: badgeId, // Using badge ID as name
          role: 'admin',
          companyId: company.id
        }
      });
      
      console.log(`Created company "${badgeId} Company" and admin user "${badgeId}"`);
    }
    
    console.log('Admin and company reset process completed successfully!');
    console.log(`Created ${adminIds.length} companies and ${adminIds.length} admin users`);
    
  } catch (error) {
    console.error('Error during admin and company reset process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
resetAndCreateAdminsWithCompanies();

/*
INSTRUCTIONS:

1. Place this file in your project root directory
2. Make sure your database is properly configured in your .env file
3. Run the script with Node.js:
   
   node admin_company_reset_with_instructions.js
   
4. The script will:
   - Delete all existing users
   - Delete all existing companies
   - Create 12 new companies (one for each admin)
   - Create 12 admin users with the specified badge IDs
   - Each admin will be associated with their own company
   
5. After running, you can log in with any of these badge IDs as an admin

Note: This script will completely reset your database by removing all users and companies.
Make sure to back up any important data before running this script.
*/
