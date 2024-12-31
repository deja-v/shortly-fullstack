import express from 'express';
import { handleCreateShortUrl,handleRedirect, handleAnalytics } from '../controllers/url.js';

const router = express.Router();

router.post('/', (req, res) => {
    handleCreateShortUrl(req,res)
});

router.get('/:id', (req, res) => {
    handleRedirect(req,res)
});

router.get('/analytics/:id', (req,res)=>{
    handleAnalytics(req,res)
})

export default router