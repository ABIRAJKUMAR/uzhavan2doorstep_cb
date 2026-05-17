import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  try {
    // 1. Create a dummy image
    fs.writeFileSync('dummy.jpg', 'fake image content');
    
    // 2. Register
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Farmer',
      email: `farmer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'Farmer',
      phone: '9999999999'
    });
    const token = regRes.data.token;
    
    const form = new FormData();
    form.append('name', 'Test Brinjal');
    form.append('category', 'Vegetables');
    form.append('quantity', '10');
    form.append('unit', 'kg');
    form.append('price', '30');
    form.append('description', 'Fresh');
    form.append('isOrganic', 'false');
    form.append('images', fs.createReadStream('dummy.jpg'));
    
    console.log('Sending upload request...');
    const res = await axios.post('http://localhost:5000/api/products', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Upload Success!', res.data);
  } catch (err) {
    console.error('Upload Failed!', err.response?.data || err.message);
  }
}
test();
