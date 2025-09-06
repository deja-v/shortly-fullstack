import React from "react";
import { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "../utils/axiosInstance";
import ShortenedUrl from "./shortenedUrl";
import UrlHistory from "./urlHistory";
import useEffectAfterFirstRender from "./custom hooks/useEffectAfterFirstRender";
export default function Url(){
    const apiKey = import.meta.env.VITE_API_KEY;
    const [url, setUrl] = useState('')
    const [shortUrl, setShortUrl] = useState(null)
    const [copied, setCopied] = useState(false)
    const [urlHistory, setUrlHistory] = useState([])
    const isInitialRender = useRef(true);
    function handleChange(e) {
        setUrl(e.target.value)
    }

    async function handleSubmit(e) {
        e.preventDefault()
    
        if (!url) {
            toast.error('Please enter a URL')
            return;
        } 
        
          // async function getURL(url) {
          //   // let body = {
          //   //   url: url,
          //   //   domain: `tinyurl.com`
          //   // }

          //   // fetch(`https://api.tinyurl.com/create`, {
          //   //   method: `POST`,
          //   //   headers: {
          //   //     accept: `application/json`,
          //   //     authorization: `Bearer ${apiKey}`,
          //   //     'content-type': `application/json`,
          //   //   },
          //   //   body: JSON.stringify(body)
          //   // })
          //   // .then(response => {
          //   //   if (response.status != 200) throw `There was a problem with the fetch operation. Status Code: ${response.status}`;
          //   //   return response.json()
          //   // })
          //   // .then(data => {
          //   //   return data.data.tiny_url
          //   // }).catch ((error) => 
          //   //   console.error(error));

          //   const apiUrl = 'https://api.tinyurl.com/create';
          //   const headers = {
          //     accept: 'application/json',
          //     authorization: `Bearer ${apiKey}`,
          //     'content-type': 'application/json',
          //   };
          
          //   const body = {
          //     url: url,
          //     domain: 'tinyurl.com',
          //   };
          
          //   try {
          //     const response = await fetch(apiUrl, {
          //       method: 'POST',
          //       headers,
          //       body: JSON.stringify(body),
          //     });
          //     const data = await response.json();
          //     return data.data.tiny_url
          //   } catch (error) {
          //     console.error('Error creating short URL:', error);
          //     throw error;
          //   }
          // }

          // const shortened = await getURL(url);

          axiosInstance.post(`/api`,{url})
          .then(response=> setShortUrl(`${import.meta.env.VITE_API_URL}/${response.data.shortId}`))
          .catch((error) => {
            console.error(error);
          })          
    }

    useEffectAfterFirstRender(()=>{
      if(shortUrl){
        function formatDate(currentDate){
          const day = String(currentDate.getDate()).padStart(2, '0');
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const year = currentDate.getFullYear();
          let hours = currentDate.getHours();
          const minutes = String(currentDate.getMinutes()).padStart(2, '0');
          const seconds = String(currentDate.getSeconds()).padStart(2, '0');
          const amPm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12; 
  
          const formattedDateTime = `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${amPm}`;
          return formattedDateTime
        }
        const currentDate = new Date();
        const newObj = {
          original:url,
          shortened:shortUrl,
          date: formatDate(currentDate)
        }
        const updatedHistory = [newObj, ...urlHistory]
        setUrlHistory(updatedHistory)
      }
      },[shortUrl])

    function handleCopy ()  {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 3000)
      }

      return (
        <div className="url-paste-container">
          <ToastContainer position="top-right"/>
            <h1 className="heading">Shorten Your Loooong Links</h1>
            <p>Shortly is an efficient and easy-to-use URL shortening service that streamlines your online experience. </p>
            <form onSubmit={handleSubmit} action="">
            <div className="wrapper">
                
                <input onChange={handleChange} className="icon" type="text" placeholder="Enter the link" />
                <button type="submit">
                    Shorten Now!
                </button>
                

            </div>
            </form>
            {shortUrl && <ShortenedUrl url={shortUrl} onCopy={handleCopy} />}
            {copied && <p className="copy-message">URL copied to clipboard!</p>}
            {urlHistory.length>0 && <UrlHistory urlHistory={urlHistory} />}
        </div>
    )
}