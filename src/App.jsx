import React, { useEffect, useState } from 'react';
import Table from './components/Table';
import SignIn from './components/SignIn';
import { useNavigate } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [signInSuccess, setSignInSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('react-demo-token');
    if (token) {
      setSignInSuccess(true);
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            signInSuccess ? <Table /> : <SignIn onSignInSuccess={() => setSignInSuccess(true)} navigate={navigate} />
          }
        />
        <Route
          path="/table"
          element={
            signInSuccess ? (
              <Table />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/signin" element={<SignIn onSignInSuccess={() => navigate('/table')} />} />
      </Routes>
    </div>
  );
}

export default App;
