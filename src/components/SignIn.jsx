import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function SignIn(props) {

  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    console.log("Email: " + email)
    console.log("Password: " + password)
    if (!email) {
      setEmailError(true);
      return;
    } else {
      setEmailError(false);
    }

    if (!password) {
      setPasswordError(true);
      return;
    } else {
      setPasswordError(false);
    }

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      handleOpen();
      return;
    }

    try{
      const response = await fetch('https://app.spiritx.co.nz/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('response')
      console.log(response)
      console.log(response.ok)
      if (response.ok){
        const responseData = await response.json();
        console.log('responseData')
        console.log(responseData)
        const token = responseData.token.token;
        localStorage.setItem('react-demo-token', token);
        //global.SharedToken = { token };
        console.log('token: ' + token)
        const user = responseData.user;
        console.log('user')
        console.log(user)
        localStorage.setItem('react-demo-token', token);
        localStorage.setItem('react-demo-user', JSON.stringify(user));

        if (token) {
          console.log('if (token)')
          props.onSignInSuccess();
          navigate('/table');
        }
      }else {
        const errorData = await response.json();
        const errorMessage = errorData.error;

        setErrorMessage(errorMessage);
        handleOpen();
      }
    }catch (error) {
      setErrorMessage('An error occured. Please try again.');
      handleOpen();
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              error={emailError}
              helperText={emailError && 'Email required'}
              onChange={() => setEmailError(false)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              error={passwordError}
              helperText={passwordError && 'Password required'}
              onChange={() => setPasswordError(false)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
        {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Typography>{errorMessage}</Typography>
          </DialogContent>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}