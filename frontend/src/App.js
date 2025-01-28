import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Translate from './Pages/Translate';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/translate/:lan1/:lan2" element={<Translate />} />
        <Route path="/*" element={<Translate />} />
      </Routes>
    </Router>
  );
}

export default App;