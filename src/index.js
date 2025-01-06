import React from 'react';
import { createRoot } from 'react-dom/client';  // React 18 ve sonrasında createRoot kullanılır
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Admin from './Admin';
import PageNotFound from './PageNotFound';

const root = createRoot(document.getElementById('root'));

root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<Admin />} />
      <Route path='*' element = {<PageNotFound/>}/>
    </Routes>
  </Router>
);