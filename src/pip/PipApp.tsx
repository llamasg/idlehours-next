import { Routes, Route } from 'react-router-dom';
import { usePipAuth } from './auth/usePipAuth';
import PipAuthGate from './auth/PipAuthGate';
import PipLayout from './PipLayout';
import PipHome from './views/PipHome';
import PipIdeas from './views/PipIdeas';
import PipClusters from './views/PipClusters';
import PipSeoHelper from './views/PipSeoHelper';
import PipGoals from './views/PipGoals';
import PipContentCreation from './views/PipContentCreation';
import PipCalendar from './views/PipCalendar';
import PipAnalytics from './views/PipAnalytics';
import PipAchievements from './views/PipAchievements';

export default function PipApp() {
  const { authed, login, logout } = usePipAuth();

  if (!authed) return <PipAuthGate onAuth={(pw) => login(pw)} />;

  return (
    <Routes>
      <Route element={<PipLayout onLogout={logout} />}>
        <Route index element={<PipHome />} />
        <Route path="ideas" element={<PipIdeas />} />
        <Route path="clusters" element={<PipClusters />} />
        <Route path="seo" element={<PipSeoHelper />} />
        <Route path="goals" element={<PipGoals />} />
        <Route path="content" element={<PipContentCreation />} />
        <Route path="calendar" element={<PipCalendar />} />
        <Route path="analytics" element={<PipAnalytics />} />
        <Route path="achievements" element={<PipAchievements />} />
      </Route>
    </Routes>
  );
}
