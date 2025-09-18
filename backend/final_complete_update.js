const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAndUpdateByMSSV() {
  try {
    console.log('🔍 Tìm user theo MSSV 2021003...\n');
    
    // Tìm sinh viên có MSSV = 2021003
    const sinhVien = await prisma.sinhVien.findUnique({
      where: { mssv: '2021003' },
      include: {
        nguoi_dung: true,
        lop: true
      }
    });
    
    if (!sinhVien) {
      console.log('❌ Không tìm thấy sinh viên có MSSV 2021003');
      return;
    }
    
    console.log('✅ Sinh viên found:');
    console.log('- SinhVien ID:', sinhVien.id);
    console.log('- MSSV:', sinhVien.mssv);
    console.log('- User ID:', sinhVien.nguoi_dung_id);
    console.log('- User name:', sinhVien.nguoi_dung?.ho_ten);
    
    // Cập nhật SinhVien record
    const updatedSinhVien = await prisma.sinhVien.update({
      where: {
        id: sinhVien.id
      },
      data: {
        // Thông tin cơ bản
        gt: 'nam',  // Sửa từ 'nu' thành 'nam'
        sdt: '0901234567',
        email_phu: 'leminhtuanpersonal@gmail.com',
        dia_chi: '123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
        
        // Thông tin khẩn cấp
        sdt_khan_cap: '0987654321',
        
        // Thông tin gia đình
        ten_cha: 'Lê Văn Hùng',
        sdt_cha: '0987654321',
        ten_me: 'Nguyễn Thị Lan',
        sdt_me: '0976543210',
        dia_chi_gia_dinh: '456 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
        
        // Thông tin học vấn
        truong_thpt: 'THPT Chuyên Lê Hồng Phong TP.HCM',
        nam_tot_nghiep_thpt: 2021,
        diem_thpt: 9.25,
        
        // Kỹ năng và sở thích - ĐẦY ĐỦ VÀ CHI TIẾT
        so_thich: 'Lập trình web và ứng dụng di động, nghiên cứu công nghệ AI/ML, chơi game online (MOBA: League of Legends, FPS: Valorant), đọc sách về công nghệ và khoa học, nghe nhạc pop/rock (The Beatles, Maroon 5), xem phim Marvel/DC, chơi guitar fingerstyle, đá bóng cuối tuần với bạn bè, du lịch khám phá những địa điểm mới, nhiếp ảnh phong cảnh và street photography, tham gia các hackathon và coding competition',
        
        ky_nang: 'KỸ NĂNG MỀM: (1) Làm việc nhóm hiệu quả và hỗ trợ đồng đội; (2) Giao tiếp và thuyết trình tự tin trước đám đông; (3) Giải quyết vấn đề một cách sáng tạo và logic; (4) Tư duy phản biện và phân tích hệ thống; (5) Quản lý thời gian và ưu tiên công việc; (6) Lãnh đạo nhóm nhỏ và phân công nhiệm vụ; (7) Thích ứng nhanh với thay đổi và học hỏi công nghệ mới. KỸ NĂNG KỸ THUẬT: Frontend (React.js, Vue.js, Angular, HTML5, CSS3, JavaScript ES6+, TypeScript, Bootstrap, Tailwind CSS, SASS); Backend (Node.js, Express.js, Spring Boot, RESTful APIs, GraphQL); Database (MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch); DevOps (Git/GitHub, Docker, Kubernetes basics, CI/CD, AWS, Firebase); Mobile (React Native, Flutter basics); Other (Python for data analysis, Java OOP, C++ algorithms, Figma, Adobe Photoshop)',
        
        // Mục tiêu nghề nghiệp - CHI TIẾT VÀ THỰC TẾ
        muc_tieu: 'MỤC TIÊU NGẮN HẠN (6 tháng - 1 năm): Hoàn thành khóa học với GPA ≥ 3.5, tích lũy kinh nghiệm thực tế qua 2-3 dự án cá nhân và 1 dự án nhóm lớn, tham gia ít nhất 2 cuộc thi lập trình, thực tập tại công ty công nghệ để làm quen môi trường làm việc chuyên nghiệp. MỤC TIÊU TRUNG HẠN (1-3 năm): Trở thành Full-stack Developer thành thạo với mức lương khởi điểm 15-20 triệu VND, có khả năng độc lập phát triển các ứng dụng web/mobile từ ý tưởng đến triển khai, nắm vững các công nghệ cloud và microservices, đóng góp vào open-source projects. MỤC TIÊU DÀI HẠN (3-7 năm): Phát triển thành Technical Lead hoặc Software Architect tại một công ty công nghệ top-tier (VNG, FPT, Tiki, Shopee...), có khả năng thiết kế kiến trúc hệ thống quy mô lớn phục vụ hàng triệu người dùng, dẫn dắt đội ngũ 5-10 developers, và khởi nghiệp một startup công nghệ có tác động tích cực đến cộng đồng.',
        
        // Cài đặt
        ngon_ngu: 'vi',
        thong_bao_email: true,
        thong_bao_sdt: true,
        
        // URL avatar
        avatar_url: null
      }
    });
    
    console.log('\n🎯 CẬP NHẬT THÀNH CÔNG TẤT CẢ THÔNG TIN!');
    console.log('══════════════════════════════════════════════');
    console.log('📋 THÔNG TIN ĐÃ CẬP NHẬT:');
    console.log('- MSSV:', updatedSinhVien.mssv);
    console.log('- Giới tính:', updatedSinhVien.gt);
    console.log('- SĐT:', updatedSinhVien.sdt);
    console.log('- Email phụ:', updatedSinhVien.email_phu);
    console.log('- Địa chỉ:', updatedSinhVien.dia_chi);
    console.log('- SĐT khẩn cấp:', updatedSinhVien.sdt_khan_cap);
    console.log('- Trường THPT:', updatedSinhVien.truong_thpt);
    console.log('- Điểm THPT:', updatedSinhVien.diem_thpt);
    console.log('- Gia đình: Cha -', updatedSinhVien.ten_cha + ' (' + updatedSinhVien.sdt_cha + ')');
    console.log('  Mẹ -', updatedSinhVien.ten_me + ' (' + updatedSinhVien.sdt_me + ')');
    console.log('- Địa chỉ gia đình:', updatedSinhVien.dia_chi_gia_dinh);
    console.log('- Sở thích:', updatedSinhVien.so_thich?.substring(0, 120) + '...');
    console.log('- Kỹ năng:', updatedSinhVien.ky_nang?.substring(0, 120) + '...');
    console.log('- Mục tiêu:', updatedSinhVien.muc_tieu?.substring(0, 120) + '...');
    console.log('- Cài đặt: Ngôn ngữ -', updatedSinhVien.ngon_ngu + ', Email -', updatedSinhVien.thong_bao_email + ', SMS -', updatedSinhVien.thong_bao_sdt);
    
    console.log('\n🚀 HOÀN THÀNH 100%! BÂY GIỜ HÃY TEST:');
    console.log('═══════════════════════════════════════════');
    console.log('1️⃣  Đăng nhập: 2021003 / Student@123');
    console.log('2️⃣  Truy cập: http://localhost:3000/profile/user');
    console.log('3️⃣  Kiểm tra TẤT CẢ 3 tab:');
    console.log('   📌 Tab 1: Thông tin cơ bản (họ tên, MSSV, email, SĐT...)');
    console.log('   📌 Tab 2: Liên hệ & Gia đình (cha, mẹ, địa chỉ...)');
    console.log('   📌 Tab 3: Học vấn & Cá nhân (THPT, kỹ năng, mục tiêu...)');
    console.log('4️⃣  Test chức năng chỉnh sửa trong từng tab');
    console.log('5️⃣  Kiểm tra validation và lưu dữ liệu');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

findAndUpdateByMSSV();