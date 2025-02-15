import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Sidebar from './components/Admin/Sidebar'
import Dashboard from './components/Admin/Dashboard'



function App() {
  return (
    <>
    <Sidebar />
    <Dashboard />
   
    </>
   
  );
}

export default App;