const API_URL = 'http://localhost:5001/api/users/signup';

const testSignup = async () => {
    const userData = {
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        mobile: `9${Date.now().toString().slice(0, 9)}`
    };

    console.log("Testing Signup with:", userData);

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        if (res.ok) {
            console.log("✅ Signup Successful!");
            console.log("Response:", data);
        } else {
            console.error("❌ Signup Failed:");
            console.error("Status:", res.status);
            console.error("Data:", data);
        }
    } catch (error) {
        console.error("❌ Network/Fetch Error:", error.message);
    }
};

testSignup();
