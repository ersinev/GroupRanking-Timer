import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Admin from './Admin'; // Yönetim sayfası

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} /> {/* Anasayfa */}
      <Route path="/admin" element={<Admin />} /> {/* Admin sayfası */}
    </Routes>
  </Router>,
  document.getElementById('root')
);
