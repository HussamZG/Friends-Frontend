import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Messenger from './pages/Messenger';
import FollowRequests from './pages/FollowRequests';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route
        element={
          <>
            <SignedIn>
              <MainLayout />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/requests" element={<FollowRequests />} />
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
    </Routes>
  );
}

export default App;
