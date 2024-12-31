import mongoose from "mongoose"
import { ShortUrl } from "../models/shortUrl.js"
import {nanoid} from "nanoid"

async function handleCreateShortUrl(req,res){
    
    try {
        const body = req.body;
        if(!body || !body.url) res.send("please provide an url")
        const result = await ShortUrl.create({
            shortId: nanoid(10),
            redirectUrl: body.url,
        })
        res.json(result)
    } catch (error) {
        res.status(400).send("error creating Short Url")
    }
     
}

async function handleRedirect(req,res){
    try {
        
        const entry = await ShortUrl.findOneAndUpdate({
            shortId: req.params.id
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now()
                }
            }
        })
        console.log(entry)
        res.redirect(entry.redirectUrl)
    } catch (error) {
        console.log(error)
        res.send("error redirecting")
    }
}

async function handleAnalytics(req,res) {
    try {
        const entry = await ShortUrl.findOne({shortId: req.params.id})
        res.json({"Clicks": entry.visitHistory.length})
    } catch (error) {
        console.log(error);
        
        res.send("error in analytics")
    }
}

export {handleCreateShortUrl,handleRedirect,handleAnalytics}