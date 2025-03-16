import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sheet, Typography, FormControl, FormLabel, Input, Button, Divider, Stack } from '@mui/joy';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            console.log('Google response:', credentialResponse);

            const response = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    credential: credentialResponse.credential 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login with Google');
        }
    };

    return (
        <Sheet
            sx={{
                width: 300,
                mx: 'auto',
                my: 4,
                py: 3,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: 'sm',
                boxShadow: 'md',
            }}
            variant="outlined"
        >
            <div>
                <Typography level="h4" component="h1">
                    Welcome back
                </Typography>
                <Typography level="body-sm">Sign in to continue.</Typography>
            </div>

            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </FormControl>

                    {error && (
                        <Typography color="danger" fontSize="sm">
                            {error}
                        </Typography>
                    )}

                    <Button type="submit" fullWidth>
                        Sign In
                    </Button>
                </Stack>
            </form>

            <Divider>or</Divider>

            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.error('Google Sign In Failed');
                    setError('Google Sign In Failed');
                }}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
            />

            <Typography
                endDecorator={<Link to="/register">Sign up</Link>}
                fontSize="sm"
                sx={{ alignSelf: 'center' }}
            >
                Don't have an account?
            </Typography>
        </Sheet>
    );
};

export default Login;