import './App.css';
import React, { useState } from 'react';
import Table from './components/Table';
import SignIn from './components/SignIn';

function App() {

  const [signInSuccess, setSignInSuccess] = useState(false);

  function handleSigInSuccess() {
    setSignInSuccess(true);
  }
  return (
    <div>
      {signInSuccess ? (
        <Table />
      ) : (
        <SignIn onSignInSuccess={handleSigInSuccess} />
      )}
    </div>
  );
}

export default App;
