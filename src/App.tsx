// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/homepage';
import GamesPage from '@/pages/gamespage';
import GameDetailPage from '@/pages/gamedetailpage';
import BlogPage from '@/pages/blogpage';
import BlogPostPage from '@/pages/blogpostpage';
import ShopPage from '@/pages/shoppage';
import QuizzesPage from '@/pages/quizzespage';
import QuizPage from '@/pages/quizpage';
import AboutPage from '@/pages/aboutpage';
import ContactPage from '@/pages/contactpage';
import DisclosurePage from '@/pages/disclosurepage';
import PrivacyPage from '@/pages/privacypage';
import NotFoundPage from '@/pages/notfoundpage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:slug" element={<GameDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quizzes/:slug" element={<QuizPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/disclosure" element={<DisclosurePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
