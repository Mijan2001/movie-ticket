import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/inngest.js';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
const allowedOrigins = [
    'https://movie-ticket-wine.vercel.app/',
    'http://localhost:5173'
];

// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(
                new Error(
                    'CORS policy does not allow access from this origin.'
                ),
                false
            );
        },
        credentials: true
    })
);

app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
    res.send('Movie Ticket Backend API');
});

// Example API route
app.get('/api/movies', (req, res) => {
    res.json([
        { id: 1, title: 'Inception', year: 2010 },
        { id: 2, title: 'Interstellar', year: 2014 }
    ]);
});

app.use('/api/inngest', serve({ client: inngest, functions }));

// Create a new route
// app.get('/api/hello', async function (req, res, next) {
//     await inngest
//         .send({
//             name: 'test/hello.world',
//             data: {
//                 email: 'testUser@example.com'
//             }
//         })
//         .catch(err => next(err));
//     res.json({ message: 'Event sent!' });
// });

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, async () => {
    try {
        console.log(`Server running on port ${PORT}`);
        await connectDB();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
});
