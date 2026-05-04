import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AboutImage from '../assets/About.png'

const About = () => {
    const [stats, setStats] = useState({
        customers: 0,
        products: 0,
        categories: 0,
        experience: 0
    });

    const [countersStarted, setCountersStarted] = useState(false);

    const targetStats = {
        customers: 12500,
        products: 850,
        categories: 65,
        experience: 5
    };

    const animateCounter = (start, end, setValue, duration = 2000) => {
        const increment = end / (duration / 50);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            setValue(Math.floor(current));
        }, 50);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !countersStarted) {
                        setCountersStarted(true);
                        
                        // Animate each counter with different durations for variety
                        animateCounter(0, targetStats.customers, (val) => 
                            setStats(prev => ({ ...prev, customers: val })), 2500);
                        animateCounter(0, targetStats.products, (val) => 
                            setStats(prev => ({ ...prev, products: val })), 2000);
                        animateCounter(0, targetStats.categories, (val) => 
                            setStats(prev => ({ ...prev, categories: val })), 1800);
                        animateCounter(0, targetStats.experience, (val) => 
                            setStats(prev => ({ ...prev, experience: val })), 1500);
                    }
                });
            },
            { threshold: 0.5 }
        );

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            observer.observe(statsSection);
        }

        return () => {
            if (statsSection) {
                observer.unobserve(statsSection);
            }
        };
    }, [countersStarted]);

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K+';
        }
        return num + '+';
    };
  return (
    <>
        <section className="about-section py-5" style={{backgroundColor: '#fafafa'}}>
            <div className="container">
                {/* Hero Section */}
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold mb-3">
                        About <span style={{color: '#007bff'}}>QuickMart</span>
                    </h1>
                    <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                        Your trusted partner for quality products and exceptional shopping experience
                    </p>
                </div>

                {/* Main Content */}
                <div className="row align-items-center g-5 mb-5">
                    <div className="col-lg-6">
                        <div className="about-content">
                            <p className="mb-4" style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                                Welcome to QuickMart, your one-stop destination for everything you need. 
                                We've been dedicated to bringing you quality products across all categories since our founding.
                            </p>
                            <p className="mb-4" style={{fontSize: '1rem', lineHeight: '1.6', color: '#666'}}>
                                Our mission is simple: to provide our customers with high-quality products from electronics and appliances to clothing, home goods, sports equipment, books, beauty products, and daily essentials, 
                                exceptional service, and a seamless shopping experience. We carefully curate 
                                our diverse collection to ensure that every item meets our standards of quality and value.
                            </p>
                            
                            {/* Call to Action */}
                            <div className="mt-4">
                                <Link 
                                    to="/products" 
                                    className="btn btn-lg me-3" 
                                    style={{
                                        backgroundColor: '#0a4db8',
                                        color: 'white',
                                        border: 'none',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#4dabf7';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#0a4db8';
                                    }}
                                >
                                    Shop Now
                                </Link>
                                <Link 
                                    to="/contact" 
                                    className="btn btn-lg btn-outline-primary"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    <div className="col-lg-6">
                        <div className="about-image text-center">
                            <div className="position-relative d-inline-block" style={{transform: 'translateY(-30px)'}}>
                                <img 
                                    src={AboutImage} 
                                    alt="QuickMart Mobile App Interface" 
                                    className="img-fluid"
                                    style={{
                                        maxWidth: '400px',
                                        height: 'auto',
                                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="row g-4 mb-5">
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-card text-center p-4 h-100 bg-white rounded shadow-sm">
                            <div className="feature-icon mb-3">
                                <i className="fas fa-gem fa-2x text-primary"></i>
                            </div>
                            <h5 className="mb-3">Quality Products</h5>
                            <p className="text-muted">We source quality products from electronics to home essentials from trusted suppliers worldwide.</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-card text-center p-4 h-100 bg-white rounded shadow-sm">
                            <div className="feature-icon mb-3">
                                <i className="fas fa-shipping-fast fa-2x text-primary"></i>
                            </div>
                            <h5 className="mb-3">Fast Shipping</h5>
                            <p className="text-muted">Quick delivery for all product categories straight to your doorstep.</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-card text-center p-4 h-100 bg-white rounded shadow-sm">
                            <div className="feature-icon mb-3">
                                <i className="fas fa-headset fa-2x text-primary"></i>
                            </div>
                            <h5 className="mb-3">24/7 Support</h5>
                            <p className="text-muted">Our customer service team is always ready to help you.</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-card text-center p-4 h-100 bg-white rounded shadow-sm">
                            <div className="feature-icon mb-3">
                                <i className="fas fa-undo fa-2x text-primary"></i>
                            </div>
                            <h5 className="mb-3">Easy Returns</h5>
                            <p className="text-muted">Hassle-free returns within 30 days if you're not completely satisfied.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="stats-section py-5" style={{backgroundColor: '#f5f8fc'}}>
            <div className="container">
                <div className="row text-center">
                    <div className="col-12 mb-4">
                        <h2 className="h3 mb-2 text-dark">Our Success in Numbers</h2>
                        <p className="lead text-muted">Growing every day with our amazing community</p>
                    </div>
                </div>
                <div className="row text-center g-4">
                    <div className="col-6 col-md-3">
                        <div className="stat-item p-3">
                            <div className="stat-icon mb-2">
                                <i className="fas fa-users fa-2x text-primary"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1 text-dark">{formatNumber(stats.customers)}</h3>
                            <p className="mb-0 text-muted">Happy Customers</p>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="stat-item p-3">
                            <div className="stat-icon mb-2">
                                <i className="fas fa-box fa-2x text-primary"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1 text-dark">{stats.products}+</h3>
                            <p className="mb-0 text-muted">Products</p>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="stat-item p-3">
                            <div className="stat-icon mb-2">
                                <i className="fas fa-tags fa-2x text-primary"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1 text-dark">{stats.categories}+</h3>
                            <p className="mb-0 text-muted">Categories</p>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="stat-item p-3">
                            <div className="stat-icon mb-2">
                                <i className="fas fa-calendar fa-2x text-primary"></i>
                            </div>
                            <h3 className="display-6 fw-bold mb-1 text-dark">{stats.experience}</h3>
                            <p className="mb-0 text-muted">Years Experience</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
  )
}

export default About