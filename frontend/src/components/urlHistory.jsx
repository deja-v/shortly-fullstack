import React, { useState,useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaCopy } from "react-icons/fa6";

export default function UrlHistory({urlHistory}){
  
  
    function copyToClipboard (url) {
      navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!');
    }
   
    
              
    const tableElements = urlHistory.map(({ original, shortened, date },index) => (
      <tr key={index}>
        <td>{original}</td>
        <td>{shortened}</td>
        <td>{date}</td>
        <td>
          <button onClick={() => copyToClipboard(shortened)}><FaCopy />
          </button>
        </td>
      </tr>
      
    ))

    return (
        <div className="url-history">
          <h2>History</h2>
          <table>
            <thead>
              <tr>
                <th>Original Link</th>
                <th>Shortened Link</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableElements}
            </tbody>
          </table>

          <ToastContainer />
        </div>
    )
}