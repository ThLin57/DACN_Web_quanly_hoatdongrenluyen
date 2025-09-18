const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

async function testDetail() {
  const prisma = new PrismaClient();
  
  try {
    // Find student with MSSV 2021003
    const student = await prisma.sinhVien.findFirst({
      where: { mssv: '2021003' },
      include: { nguoi_dung: true }
    });
    
    if (student && student.nguoi_dung) {
      // Create token
      const token = jwt.sign(
        { id: student.nguoi_dung.id, role: 'SINH_VIEN' }, 
        'supersecret_in_docker_change_me'
      );
      
      // Get first notification ID
      const notifications = await prisma.thongBao.findFirst({
        where: { nguoi_nhan_id: student.nguoi_dung.id }
      });
      
      if (notifications) {
        console.log('Testing notification detail for ID:', notifications.id);
        
        // Test API call
        const http = require('http');
        const req = http.request(`http://localhost:3001/api/notifications/${notifications.id}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        }, res => {
          let data = '';
          res.on('data', d => data += d);
          res.on('end', () => {
            console.log('Detail API Status:', res.statusCode);
            console.log('Detail API Response:', data.substring(0, 800));
          });
        });
        req.end();
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDetail();
