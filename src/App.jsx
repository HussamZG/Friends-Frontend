import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import MainLayout from './components/Layout/MainLayout';
import FriendsLoading from './components/UI/FriendsLoading';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));
const Messenger = lazy(() => import('./pages/Messenger'));
const FollowRequests = lazy(() => import('./pages/FollowRequests'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const PostDetails = lazy(() => import('./pages/PostDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Landing = lazy(() => import('./pages/Landing'));

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<FriendsLoading size="large" />}>
        <Routes>
          <Route
            element={
              <>
                <SignedIn>
                  <MainLayout />
                </SignedIn>
                <SignedOut>
                  <Landing />
                </SignedOut>
              </>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/chat" element={<Messenger />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route
            path="/sign-in/*"
            element={<SignIn routing="path" path="/sign-in" />}
          />
          <Route
            path="/sign-up/*"
            element={<SignUp routing="path" path="/sign-up" />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
