import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Firebase Setup
initializeApp({
    credential: cert('credentials.json')
});
const db = getFirestore();

// 1. Data upload / add karne ka route
app.post('/upload', async (req, res) => {
    try {
        // Firebase Firestore mein save karein
        await db.collection('portfolio').add({
            ...req.body,
            createdAt: new Date().toISOString()
        });
        
        // Frontend ko bilkul wahi response bhejein jo use chahiye (success, imageUrl, publicId)
        res.json({ 
            success: true, 
            message: "Data add ho gaya!",
            imageUrl: "https://example.com/dummy-resume-url.pdf", // Dummy URL taake frontend crash na ho
            publicId: "dummy_id_123"
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Data nikalne ka route
app.get('/get-data', async (req, res) => {
    try {
        const snapshot = await db.collection('portfolio').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));