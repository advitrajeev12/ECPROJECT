import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce')
    .then(async () => {
        console.log('Connected to DB');
        const admins = await Admin.find({});
        console.log('Current admins:', admins);
        process.exit(0);
    })
    .catch(err => {
        console.error('DB Error', err);
        process.exit(1);
    });
