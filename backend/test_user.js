const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

async function testUser() {
  const prisma = new PrismaClient();
  
  try {
    // Find student with MSSV 2021003
    const student = await prisma.sinhVien.findFirst({
      where: { mssv: '2021003' },
      include: { nguoi_dung: true }
    });
    
    console.log('Student found:', JSON.stringify(student, null, 2));
    
    if (student && student.nguoi_dung) {
      // Create token
      const token = jwt.sign(
        { id: student.nguoi_dung.id, role: 'SINH_VIEN' }, 
        'supersecret_in_docker_change_me'
      );
      
      console.log('Token:', token);
      
      // Test API call
      const http = require('http');
      const req = http.request('http://localhost:3001/api/notifications', {
        headers: { 'Authorization': 'Bearer ' + token }
      }, res => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          console.log('API Status:', res.statusCode);
          console.log('API Response:', data.substring(0, 500));
        });
      });
      req.end();
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUser();
