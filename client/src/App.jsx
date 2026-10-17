import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import GroupPage from './pages/GroupPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:id" element={<GroupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;