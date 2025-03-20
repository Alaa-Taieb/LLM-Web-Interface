/**
 * @fileoverview Combined Authentication component handling both login and registration
 * Features an animated info section and a dynamic auth form with Google OAuth integration
 * @module pages/auth/Auth
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, Typography, Input, Button, Divider, Stack, Box } from '@mui/joy';
import { GoogleLogin } from '@react-oauth/google';
import styles from './Auth.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

/**
 * Combined Authentication component that handles both login and registration
 * Features animated UI elements, social links, and responsive design
 * 
 * @component
 * @returns {JSX.Element} Authentication page component
 */
const Auth = () => {
    const navigate = useNavigate();

    /** @type {[boolean, Function]} Toggle between login and registration modes */
    const [isLogin, setIsLogin] = useState(true);

    /** @type {[FormData, Function]} Form data state and setter */
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    /** @type {[string, Function]} Error message state and setter */
    const [error, setError] = useState('');

    /**
     * Handles form input changes
     * Updates formData state with new values
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /**
     * Handles form submission for both login and registration
     * Sends authentication request to backend API
     * 
     * @async
     * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
     * @throws {Error} If authentication fails
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? 'login' : 'register';
            const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isLogin ? {
                    email: formData.email,
                    password: formData.password
                } : formData),
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

    /**
     * Handles Google OAuth authentication success
     * Sends Google credentials to backend for verification
     * 
     * @async
     * @param {Object} credentialResponse - Google OAuth credential response
     * @param {string} credentialResponse.credential - Google OAuth token
     * @throws {Error} If Google authentication fails
     */
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

    /** @type {Array<FloatingShape>} Configuration for animated floating shapes */
    const shapes = [
        // Larger shapes with adjusted properties
        { color: '#FF5757', size: 180, speed: 15, delay: 0, rotate: true },
        { color: '#7C3AED', size: 250, speed: 25, delay: 2, rotate: true },
        { color: '#60A5FA', size: 220, speed: 20, delay: 1, rotate: false },
        { color: '#34D399', size: 200, speed: 18, delay: 3, rotate: true },
        // Additional large shapes
        { color: '#F472B6', size: 160, speed: 22, delay: 1.5, rotate: true },
        { color: '#FBBF24', size: 240, speed: 17, delay: 2.5, rotate: false },
        { color: '#818CF8', size: 190, speed: 23, delay: 0.5, rotate: true },
        { color: '#4ADE80', size: 210, speed: 19, delay: 1.8, rotate: true },
        { color: '#FB923C', size: 230, speed: 21, delay: 2.2, rotate: false },
        { color: '#38BDF8', size: 170, speed: 24, delay: 1.2, rotate: true },
        { color: '#A78BFA', size: 260, speed: 16, delay: 2.8, rotate: true },
        { color: '#F87171', size: 165, speed: 20, delay: 0.8, rotate: false },
        // Some medium-sized shapes
        { color: '#6EE7B7', size: 140, speed: 28, delay: 1.6, rotate: true },
        { color: '#C084FC', size: 145, speed: 26, delay: 2.4, rotate: false },
        { color: '#FDE047', size: 135, speed: 30, delay: 0.3, rotate: true }
    ];

    /** @type {Object} Common styles for input fields */
    const inputStyles = {
        '--Input-radius': '4px',
        '--Input-gap': '8px',
        '--Input-placeholderOpacity': 0.7,
        '--Input-focusedThickness': '1px',
        '--Input-minHeight': '44px',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        color: '#1f2937',
        transition: 'all 0.2s ease',
        '&:hover': {
            borderColor: '#9ca3af',
        },
        '&:focus-within': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
        }
    };

    /** @type {Array<SocialLink>} Configuration for social media links */
    const socialLinks = [
        { name: 'GitHub', url: 'https://github.com/Alaa-Taieb' },
        { name: 'LinkedIn', url: 'https://www.linkedin.com/in/alaa-taieb/' },
        { 
            name: 'Portfolio (Coming Soon)', 
            url: '#',
            isWIP: true
        }
    ];

    return (
        <Box className={styles.authContainer}>
            {/* Info Section */}
            <Box className={styles.infoSection}>
                {/* Animated Floating Shapes */}
                {shapes.map((shape, index) => (
                    <motion.div
                        key={index}
                        className={styles.floatingShape}
                        animate={{
                            x: [0, 30, -30, 0],
                            y: [0, -40, 40, 0],
                            rotate: shape.rotate ? [0, 180, 360] : 0,
                            scale: [1, 1.1, 0.9, 1]
                        }}
                        transition={{
                            duration: shape.speed,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: shape.delay,
                            times: [0, 0.33, 0.66, 1]
                        }}
                        style={{
                            width: shape.size,
                            height: shape.size,
                            left: `${Math.random() * 80}%`,
                            top: `${Math.random() * 80}%`,
                            backgroundColor: shape.color,
                            opacity: 0.15
                        }}
                    />
                ))}

                {/* Profile Section */}
                <motion.div 
                    className={styles.profileSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.div 
                        className={styles.profileImage}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <img src="/assets/profile.jpg" alt="Alaa Taieb" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Typography 
                            level="h2" 
                            sx={{ 
                                fontSize: '2rem',
                                textAlign: 'center',
                                mb: 0.5,
                                background: 'linear-gradient(135deg, #ffffff 0%, #94c6ff 100%)', // Softer gradient from white to light blue
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                fontWeight: '600',
                                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' // Added subtle drop shadow for depth
                            }}
                        >
                            Building AI Tools for Developers
                        </Typography>
                        <Typography 
                            level="body-lg"
                            sx={{ 
                                fontSize: '1.2rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                textAlign: 'center',
                                fontWeight: 500
                            }}
                        >
                            Hi, I'm Alaa Taieb
                        </Typography>
                        <Typography 
                            level="body-md"
                            sx={{ 
                                fontSize: '1rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                textAlign: 'center',
                                fontStyle: 'italic'
                            }}
                        >
                            Full-Stack Developer & AI Specialist
                        </Typography>
                    </motion.div>
                </motion.div>

                {/* Content Section */}
                <motion.div 
                    className={styles.contentSection}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {/* About Section */}
                    <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={styles.infoBlock}
                    >
                        <h3 className={styles.sectionTitle}>About Me</h3>
                        <p className={styles.sectionContent}>
                            With over 5 years in software development, I'm passionate about creating 
                            tools that make developers' lives easier. Currently focused on AI-powered 
                            development solutions.
                        </p>
                    </motion.div>

                    {/* Features Section */}
                    <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={styles.infoBlock}
                    >
                        <h3 className={styles.sectionTitle}>Key Features</h3>
                        <div className={styles.featuresList}>
                            <div className={styles.feature}>
                                <span>🤖</span>
                                <p>AI-Powered Assistant with Groq's LLM</p>
                            </div>
                            <div className={styles.feature}>
                                <span>🎯</span>
                                <p>Developer-Focused Workflow</p>
                            </div>
                            <div className={styles.feature}>
                                <span>💡</span>
                                <p>Smart Context Understanding</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tech Stack */}
                    <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={styles.infoBlock}
                    >
                        <h3 className={styles.sectionTitle}>Built With</h3>
                        <div className={styles.techStack}>
                            <span>React</span>
                            <span>Node.js</span>
                            <span>Groq LLM</span>
                            <span>MongoDB</span>
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <h3 className={styles.sectionTitle}>Connect With Me</h3>
                        <div className={styles.socialLinks}>
                            {[
                                { name: 'GitHub', url: 'https://github.com/Alaa-Taieb' },
                                { name: 'LinkedIn', url: 'https://www.linkedin.com/in/alaa-taieb/' },
                                { 
                                    name: 'Portfolio (Coming Soon)', 
                                    url: '#',  // Remove the URL to prevent navigation
                                    isWIP: true  // Add flag to identify work in progress items
                                }
                            ].map((link, index) => (
                                <motion.a
                                    key={link.name}
                                    href={link.url}
                                    className={`${styles.socialLink} ${link.isWIP ? styles.wipLink : ''}`}
                                    whileHover={{ y: -3, scale: 1.05 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={link.isWIP ? (e) => e.preventDefault() : undefined}
                                    style={link.isWIP ? { cursor: 'not-allowed' } : {}}
                                >
                                    {link.name}
                                    {link.isWIP && (
                                        <span 
                                            style={{ 
                                                marginLeft: '8px',
                                                fontSize: '0.8em',
                                                opacity: 0.7,
                                                color: '#FFA500'  // Orange color for WIP indicator
                                            }}
                                        >
                                            🚧
                                        </span>
                                    )}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </Box>

            {/* Auth Form Section */}
            <Box className={styles.formSection}>
                <div className={styles.formWrapper}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className={styles.welcomeHeader}>
                                <h2 className={styles.welcomeTitle}>
                                    {isLogin ? 'Welcome back!' : 'Create account'}
                                </h2>
                                <p className={styles.welcomeSubtitle}>
                                    {isLogin 
                                        ? 'Sign in to continue your coding journey with AI assistance'
                                        : 'Join us to enhance your coding experience with AI-powered tools'
                                    }
                                </p>
                            </div>

                            <Sheet
                                sx={{
                                    width: '320px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2.5,
                                    backgroundColor: 'transparent',
                                }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google Sign In Failed')}
                                        useOneTap={false}
                                        theme="filled_blue"
                                        size="large"
                                        text={isLogin ? "signin_with" : "signup_with"}
                                        shape="rectangular"
                                        width="100%"
                                    />
                                </Box>

                                <Divider sx={{ 
                                    my: 1,
                                    '&::before, &::after': {
                                        borderColor: '#404040',
                                    }
                                }}>
                                    <Typography level="body-sm" sx={{ color: '#9ca3af', px: 1 }}>
                                        or
                                    </Typography>
                                </Divider>
                                
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={2}>
                                        {!isLogin && (
                                            <Input
                                                name="name"
                                                type="text"
                                                placeholder="Name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                startDecorator={<PersonOutlineOutlinedIcon sx={{ color: '#9ca3af' }} />}
                                                sx={inputStyles}
                                            />
                                        )}

                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            startDecorator={<EmailOutlinedIcon sx={{ color: '#9ca3af' }} />}
                                            sx={inputStyles}
                                        />

                                        <Input
                                            name="password"
                                            type="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            startDecorator={<LockOutlinedIcon sx={{ color: '#9ca3af' }} />}
                                            sx={inputStyles}
                                        />

                                        {error && (
                                            <Typography 
                                                color="danger" 
                                                level="body-sm"
                                                sx={{ 
                                                    textAlign: 'center',
                                                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                                    color: '#ef4444',
                                                    p: 1,
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {error}
                                            </Typography>
                                        )}

                                        <Button 
                                            type="submit" 
                                            sx={{
                                                backgroundColor: '#3b82f6',
                                                color: '#fff',
                                                height: '44px',
                                                borderRadius: '4px',
                                                textTransform: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                '&:hover': {
                                                    backgroundColor: '#2563eb',
                                                }
                                            }}
                                        >
                                            {isLogin ? 'Sign in' : 'Create account'}
                                        </Button>
                                    </Stack>
                                </form>

                                <Typography
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                        setFormData({ name: '', email: '', password: '' });
                                    }}
                                    level="body-sm"
                                    sx={{ 
                                        alignSelf: 'center',
                                        cursor: 'pointer',
                                        color: '#3b82f6',
                                        '&:hover': { 
                                            color: '#60a5fa'
                                        }
                                    }}
                                >
                                    {isLogin 
                                        ? "Don't have an account? Sign up" 
                                        : "Already have an account? Sign in"
                                    }
                                </Typography>
                            </Sheet>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Box>
        </Box>
    );
};

export default Auth;



