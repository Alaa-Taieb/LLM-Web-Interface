import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sheet, Typography, FormControl, FormLabel, Input, Button, Divider, Stack, Box } from '@mui/joy';
import { GoogleLogin } from '@react-oauth/google';
import styles from './Auth.module.css';
import { motion } from 'framer-motion';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
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
            const response = await fetch('http://localhost:5000/api/auth/register', {
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
            const response = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Google authentication failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            console.error('Google auth error:', err);
            setError(err.message || 'Failed to authenticate with Google');
        }
    };

    const shapes = [
        { color: '#FF5757', size: 80 },
        { color: '#7C3AED', size: 120 },
        { color: '#60A5FA', size: 100 },
        { color: '#34D399', size: 90 },
    ];

    return (
        <Box className={styles.authContainer}>
            {/* Left side - Info and animations */}
            <Box className={styles.infoSection}>
                <div className={styles.shapesContainer}>
                    {shapes.map((shape, index) => (
                        <motion.div
                            key={index}
                            className={styles.shape}
                            style={{
                                backgroundColor: shape.color,
                                width: shape.size,
                                height: shape.size,
                                borderRadius: '50%',
                            }}
                            animate={{
                                x: [0, 30, 0],
                                y: [0, -30, 0],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                                delay: index * 2,
                            }}
                        />
                    ))}
                </div>
                <Box className={styles.infoContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography level="h1" sx={{ mb: 2, color: '#fff' }}>
                            Welcome to CodeChat AI
                        </Typography>
                        <Typography level="body-lg" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>
                            Your intelligent coding companion. Get instant help with code reviews,
                            debugging, and best practices.
                        </Typography>
                        <Box className={styles.features}>
                            {['Real-time code assistance', 'Smart debugging', 'Best practices guidance'].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 * (index + 1) }}
                                    className={styles.feature}
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {feature}
                                </motion.div>
                            ))}
                        </Box>
                    </motion.div>
                </Box>
            </Box>

            {/* Right side - Auth form */}
            <Box className={styles.formSection}>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Sheet
                        sx={{
                            width: 400,
                            py: 3,
                            px: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            borderRadius: 'sm',
                            boxShadow: 'lg',
                        }}
                        variant="outlined"
                    >
                        <Typography level="h3" component="h1" sx={{ mb: 2 }}>
                            Create Account
                        </Typography>
                        
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                <FormControl>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </FormControl>

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

                                <Button type="submit" size="lg">
                                    Sign Up
                                </Button>
                            </Stack>
                        </form>

                        <Divider sx={{ my: 2 }}>or</Divider>

                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Sign In Failed')}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            text="signup_with"
                            shape="rectangular"
                            width="100%"
                        />

                        <Typography
                            endDecorator={<Link to="/login">Sign in</Link>}
                            level="body-sm"
                            sx={{ alignSelf: 'center' }}
                        >
                            Already have an account?
                        </Typography>
                    </Sheet>
                </motion.div>
            </Box>
        </Box>
    );
};

export default Register;