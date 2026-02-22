const API_URL = 'http://localhost:5001/api/users';

const testAuth = async () => {
    try {
        const randomEmail = `testuser_${Date.now()}@example.com`;
        const randomMobile = `9${Math.floor(Math.random() * 900000000) + 100000000}`;
        const password = 'password123';

        console.log(`\n1. Testing Signup with ${randomEmail} / ${randomMobile}...`);
        try {
            const signupRes = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Test User',
                    email: randomEmail,
                    mobile: randomMobile,
                    password: password
                })
            });
            console.log('Signup Status:', signupRes.status);
            const signupData = await signupRes.json();
            console.log('Signup Data:', signupData);
        } catch (error) {
            console.error('Signup Failed:', error.message);
        }

        console.log('\n2. Testing Login (Password)...');
        try {
            const loginRes = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: randomEmail, // Can be email or mobile
                    password: password
                })
            });
            console.log('Login Status:', loginRes.status);
            const loginData = await loginRes.json();
            console.log('Login Data:', loginData);

        } catch (error) {
            console.error('Login Failed:', error.message);
        }

        console.log('\n3. Testing Send OTP...');
        try {
            const otpRes = await fetch(`${API_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: randomMobile })
            });
            console.log('Send OTP Status:', otpRes.status);
            const otpData = await otpRes.json();
            console.log('Send OTP Data:', otpData);
        } catch (error) {
            console.error('Send OTP Failed:', error.message);
        }

        console.log('\n4. Testing Verify OTP...');
        try {
            const verifyRes = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: randomMobile, otp: '123456' })
            });
            console.log('Verify OTP Status:', verifyRes.status);
            const verifyData = await verifyRes.json();
            console.log('Verify OTP Data:', verifyData);
        } catch (error) {
            console.error('Verify OTP Failed:', error.message);
        }

    } catch (error) {
        console.error('Test Script Error:', error);
    }
};

testAuth();
