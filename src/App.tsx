import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './components/Home/HomePage';
import PortfolioPage from './components/Portfolio/PortfolioPage';
import ContactPage from './components/Contact/ContactPage';
import EventGalleryPage from './components/Portfolio/EventGalleryPage';
import EventDetailPage from './components/Portfolio/EventDetailPage';
import ShootingGalleryPage from './components/Portfolio/ShootingGalleryPage';
import ShootingDetailPage from './components/Portfolio/ShootingDetailPage';
import ArtGalleryPage from './components/Portfolio/ArtGalleryPage';
import ArtDetailPage from './components/Portfolio/ArtDetailPage';
import DrawingGalleryPage from './components/Portfolio/DrawingGalleryPage';
import DrawingDetailPage from './components/Portfolio/DrawingDetailPage';
import { ThemeProvider } from './context/ThemeContext';
import ShootingsIndex from './components/Portfolio/ShootingsIndex';
import ShootingDetail from './components/Portfolio/ShootingDetailPage';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/events" element={<EventGalleryPage />} />
            <Route path="/portfolio/events/:eventId" element={<EventDetailPage />} />
            <Route path="/portfolio/shootings" element={<ShootingGalleryPage />} />
            <Route path="/portfolio/shootings/:shootingId" element={<ShootingDetailPage />} />
            <Route path="/portfolio/art" element={<ArtGalleryPage />} />
            <Route path="/portfolio/art/:artId" element={<ArtDetailPage />} />
            <Route path="/portfolio/drawings" element={<DrawingGalleryPage />} />
            <Route path="/portfolio/drawings/:drawingId" element={<DrawingDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/portfolio/shootings" element={<ShootingsIndex />} />
            <Route path="/portfolio/shootings/:shootingId" element={<ShootingDetail />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;