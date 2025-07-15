import { getDB } from '../config/database.js';
import { logger } from '../middleware/logger.js';
import crypto from 'crypto';

const generateShortcode = () => {
    return crypto.randomBytes(4).toString('hex');
};

const getLocationFromIP = (ip) => {
    
    const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Mumbai, IN', 'Sydney, AU'];
    return locations[Math.floor(Math.random() * locations.length)];
};

export const createShortUrl = async (originalUrl, validity, customShortcode) => {
    const db = getDB();
    
    try {
        let shortcode = customShortcode;
        
     
        if (!shortcode) {
            do {
                shortcode = generateShortcode();
            
                const [existing] = await db.execute(
                    'SELECT shortcode FROM urls WHERE shortcode = ?',
                    [shortcode]
                );
                if (existing.length === 0) break;
            } while (true);
        } else {
           
            const [existing] = await db.execute(
                'SELECT shortcode FROM urls WHERE shortcode = ?',
                [shortcode]
            );
            
            if (existing.length > 0) {
                throw new Error('Shortcode already exists');
            }
        }
        
      
        const expiry = new Date(Date.now() + validity * 60 * 1000);
        
       
        await db.execute(
            'INSERT INTO urls (original_url, shortcode, expiry) VALUES (?, ?, ?)',
            [originalUrl, shortcode, expiry]
        );
        
        const shortLink = `${process.env.BASE_URL || 'http://localhost:3000'}/${shortcode}`;
        
        logger.info('Short URL created in database', { 
            shortcode, 
            originalUrl, 
            expiry: expiry.toISOString() 
        });
        
        return {
            shortLink,
            expiry: expiry.toISOString(),
            shortcode
        };
    } catch (error) {
        logger.error('Error in createShortUrl service', { error: error.message });
        throw error;
    }
};

export const getUrlByShortcode = async (shortcode) => {
    const db = getDB();
    
    try {
        const [rows] = await db.execute(
            'SELECT * FROM urls WHERE shortcode = ?',
            [shortcode]
        );
        
        if (rows.length === 0) {
            return null;
        }
        
        return rows[0];
    } catch (error) {
        logger.error('Error in getUrlByShortcode service', { error: error.message });
        throw error;
    }
};

export const recordClick = async (shortcode, referrer, ipAddress, userAgent) => {
    const db = getDB();
    
    try {
        const location = getLocationFromIP(ipAddress);
        
       
        await db.execute(
            'INSERT INTO clicks (shortcode, referrer, ip_address, user_agent, location) VALUES (?, ?, ?, ?, ?)',
            [shortcode, referrer, ipAddress, userAgent, location]
        );
        
       
        await db.execute(
            'UPDATE urls SET click_count = click_count + 1 WHERE shortcode = ?',
            [shortcode]
        );
        
        logger.info('Click recorded', { shortcode, referrer, location });
    } catch (error) {
        logger.error('Error in recordClick service', { error: error.message });
        throw error;
    }
};

export const getUrlStats = async (shortcode) => {
    const db = getDB();
    
    try {
       
        const [urlRows] = await db.execute(
            'SELECT * FROM urls WHERE shortcode = ?',
            [shortcode]
        );
        
        if (urlRows.length === 0) {
            return null;
        }
        
        const urlData = urlRows[0];
        
      
        const [clickRows] = await db.execute(
            'SELECT clicked_at, referrer, ip_address, location FROM clicks WHERE shortcode = ? ORDER BY clicked_at DESC',
            [shortcode]
        );
        
        const clickData = clickRows.map(click => ({
            timestamp: click.clicked_at,
            referrer: click.referrer || 'direct',
            location: click.location
        }));
        
        logger.info('URL statistics retrieved', { 
            shortcode, 
            clickCount: urlData.click_count,
            totalClicks: clickData.length 
        });
        
        return {
            shortcode,
            originalUrl: urlData.original_url,
            createdAt: urlData.created_at,
            expiry: urlData.expiry,
            clickCount: urlData.click_count,
            clicks: clickData
        };
    } catch (error) {
        logger.error('Error in getUrlStats service', { error: error.message });
        throw error;
    }
};