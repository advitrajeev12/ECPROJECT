import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://10.11.0.249:5001';
// const API_URL = 'http://127.0.0.1:5001'; // Fallback for testing

async function testFlow() {
    console.log(`Testing Full Flow against ${API_URL}...`);
    const timestamp = Date.now();
    const adminUser = {
        name: `Flow Admin ${timestamp}`,
        email: `flowadmin${timestamp}@test.com`,
        password: 'password123',
        mobile: `${timestamp.toString().slice(-10)}`,
        role: 'admin'
    };

    try {
        // 1. Signup
        console.log('\n1. Testing Signup...');
        try {
            const signupRes = await axios.post(`${API_URL}/api/users/signup`, adminUser);
            console.log('✅ Signup Success:', signupRes.data.message);
        } catch (e) {
            console.error('❌ Signup Failed:', e.response?.data || e.message);
            // If user already exists (rare with timestamp), verify login works
            if (e.response?.status !== 400) throw e;
        }

        // 2. Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/api/users/login`, {
            email: adminUser.email,
            password: adminUser.password
        });
        console.log('✅ Login Success. Token/Cookie received.');

        // Extract Cookie if using cookies
        const cookie = loginRes.headers['set-cookie'];
        const headers = cookie ? { Cookie: cookie } : {};

        // 3. Create Product
        console.log('\n3. Testing Product Creation...');
        const productData = {
            name: `Flow Test Product ${timestamp}`,
            price: 500,
            category: 'bamboo',
            description: 'Created by automated test flow',
            countInStock: 200,
            image: '/uploads/placeholder.jpg'
        };

        const productRes = await axios.post(`${API_URL}/api/products`, productData, { headers });
        console.log('✅ Product Creation Success:', productRes.data.data.name);

        // 4. List Products (Public Route)
        console.log('\n4. Verifying Public Visibility...');
        const listRes = await axios.get(`${API_URL}/api/products`);
        const found = listRes.data.data.find(p => p.name === productData.name);

        if (found) {
            console.log(`✅ Verification Success: Product "${found.name}" is visible publically.`);
        } else {
            console.error('❌ Verification Failed: Product not found in public list.');
        }

    } catch (error) {
        console.error('\n❌ CRITICAL FAILURE:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error(`Check if server is running and reachable at ${API_URL}`);
        }
    }
}

testFlow();
