import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Banner from '../components/Banner'
import Features from '../components/Features'

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
        <Banner />
        
        {/* Authentication Call-to-Action */}
        {!isAuthenticated() && (
          <section className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="container text-center">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <h3 className="mb-3">Ready to Start Shopping?</h3>
                  <p className="lead text-muted mb-4">
                    Join thousands of satisfied customers and discover amazing products at unbeatable prices!
                  </p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <Link to="/signup" className="btn btn-primary btn-lg">
                      <i className="fas fa-user-plus me-2"></i>Create Account
                    </Link>
                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-sign-in-alt me-2"></i>Sign In
                    </Link>
                  </div>
                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="fas fa-lock me-1"></i>
                      Secure registration • Free to join • Start shopping immediately
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        
        <Features />
    </>
  )
}

export default Home