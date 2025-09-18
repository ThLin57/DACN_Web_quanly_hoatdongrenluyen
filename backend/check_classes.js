const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClasses() {
  try {
    const classes = await prisma.lop.findMany();
    
    console.log('🔍 Total classes in database:', classes.length);
    
    if (classes.length > 0) {
      console.log('\n📊 First class sample:');
      console.log(JSON.stringify(classes[0], null, 2));
    } else {
      console.log('❌ No classes found in database!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClasses();