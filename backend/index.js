import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import urlRoutes from './routes/urlRoutes.js';
import { loggerMiddleware } from './middleware/logger.js';
import { connectDB } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// dataBase conection
connectDB();


app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);


app.use('/shorturls', urlRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener Service is running!' });
});


app.get('/:shortcode', async (req, res) => {
    try {
        const { shortcode } = req.params;
        const { getUrlByShortcode, recordClick } = await import('./services/urlService.js');
        
        const urlData = await getUrlByShortcode(shortcode);
        
        if (!urlData) {
            return res.status(404).json({ error: 'Short URL not found' });
        }
        
      
        if (new Date() > new Date(urlData.expiry)) {
            return res.status(410).json({ error: 'Short URL has expired' });
        }
        
    
        await recordClick(shortcode, req.headers.referer || 'direct', req.ip);
        
        // Redirect to original URL
        res.redirect(urlData.original_url);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error  middleware (require 4 paramter)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// error
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});