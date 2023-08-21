import React, { useEffect, useState } from 'react';
import Table from './components/Table';
import SignIn from './components/SignIn';
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  const [signInSuccess, setSignInSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('react-demo-token');
    if (token) {
      setSignInSuccess(true);
    }
  }, []);

  // function handleSigInSuccess() {
  //   console.log('handleSigInSuccess')
  //   setSignInSuccess(true);
  //   const navigate = useNavigate();
  //   navigate('/table');
  //   };

  return (
    <Router>
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
    </Router>
  );
}

export default App;