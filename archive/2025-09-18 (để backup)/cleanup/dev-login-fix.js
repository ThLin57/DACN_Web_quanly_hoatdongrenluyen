// Clear localStorage và test login
console.log('🧹 Clearing localStorage...');
localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('✅ Cleared token and user from localStorage');

// Test login function
async function testLoginDev() {
    console.log('🔐 Testing login with backend-dev...');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                maso: '2021003',
                password: 'Student@123'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login Success!');
            console.log('Token:', data.data.token.substring(0, 30) + '...');
            console.log('User:', data.data.user.ho_ten);
            
            // Save to localStorage
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            console.log('✅ Token saved to localStorage');
            console.log('🔄 Reloading page...');
            setTimeout(() => location.reload(), 1000);
            
        } else {
            console.error('❌ Login Failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Auto-run test login
testLoginDev();