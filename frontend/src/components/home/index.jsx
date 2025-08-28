import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";
import axiosInstance from "../../utils/axiosInstance";

const Home = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [urlHistory, setUrlHistory] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('anonymousUrlHistory');
    if (savedHistory) {
      try {
        setUrlHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading URL history:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('anonymousUrlHistory', JSON.stringify(urlHistory));
  }, [urlHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setSuccessMessage('Please enter a URL');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      new URL(url.trim());
    } catch (error) {
      setSuccessMessage('Please enter a valid URL (e.g., https://example.com)');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    try {
      const response = await axiosInstance.post('/shorten', { url: url.trim() });
      const data = response.data;
      
      if (data.success) {
        setShortUrl(data.data.shortUrl);
        setSuccessMessage('URL shortened successfully!');
        
        const newUrlEntry = {
          id: Date.now(),
          original: url.trim(),
          shortened: data.data.shortUrl,
          shortId: data.data.shortId,
          createdAt: data.data.createdAt,
          clicks: 0
        };
        
        setUrlHistory(prev => [newUrlEntry, ...prev.slice(0, 9)]);
        setUrl('');
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        console.error('Error shortening URL:', data.message);
        setSuccessMessage(`Error: ${data.message}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      setSuccessMessage('Error: Failed to shorten URL. Please try again.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeHeading}>Shorten Your Loooong Links</h1>
      <p className={styles.homeDescription}>
        Shortly is an efficient and easy-to-use URL shortening service that streamlines your online experience.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.urlForm}>
        <div className={styles.inputWrapper}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter the long URL here..."
            className={styles.urlInput}
            required
          />
          <button 
            type="submit" 
            className={styles.shortenButton}
            disabled={isLoading}
          >
            {isLoading ? 'Shortening...' : 'Shorten Now!'}
          </button>
        </div>
      </form>

      {successMessage && (
        <div className={`${styles.messageContainer} ${successMessage.startsWith('Error:') ? styles.errorMessage : styles.successMessage}`}>
          {successMessage}
        </div>
      )}

      {shortUrl && (
        <div className={styles.resultContainer}>
          <h3>Your shortened URL:</h3>
          <div className={styles.shortUrlDisplay}>
            <span className={styles.shortUrl}>{shortUrl}</span>
            <button 
              onClick={() => copyToClipboard(shortUrl)}
              className={styles.copyButton}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {urlHistory.length > 0 && (
        <div className={styles.historyContainer}>
          <h3>Recent URLs</h3>
          <div className={styles.urlList}>
                         {urlHistory.map((entry) => (
               <div key={entry.id} className={styles.urlItem}>
                 <div className={styles.urlInfo}>
                   <div className={styles.urlRow}>
                     <span className={styles.urlLabel}>Original:</span>
                     <span className={styles.urlValue}>{entry.original}</span>
                   </div>
                   <div className={styles.urlRow}>
                     <span className={styles.urlLabel}>Shortened:</span>
                     <span className={styles.urlValue}>{entry.shortened}</span>
                   </div>
                   <div className={styles.urlRow}>
                     <span className={styles.urlLabel}>Created:</span>
                     <span className={styles.urlValue}>{new Date(entry.createdAt).toLocaleDateString()}</span>
                   </div>
                 </div>
                 <div className={styles.urlActions}>
                   <button 
                     onClick={() => copyToClipboard(entry.shortened)}
                     className={styles.copyButton}
                   >
                     Copy
                   </button>
                   <button 
                     onClick={() => copyToClipboard(entry.original)}
                     className={styles.copyOriginalButton}
                   >
                     Copy Original
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className={styles.signupPrompt}>
        <p>Want to save your URLs permanently and get analytics?</p>
        <Link to="/register" className={styles.btnPrimary}>
          Sign Up for Free
        </Link>
      </div>
    </div>
  );
};

export default Home;
