import React from 'react';

export default function ShortenedUrl({ url, onCopy }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    onCopy();
  };

  return (
    <div className="shortened-url">
      <p>Shortened URL: <span>{url}</span></p>
      <button className="copy-button-shorten" onClick={handleCopy}>
        Copy
      </button>
    </div>
  );
};
