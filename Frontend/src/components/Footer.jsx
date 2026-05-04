import React from 'react'

const Footer = () => {
  return (
    <>
      <section className='footer-section' style={{marginTop: '3rem'}}>
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="footer-content">
                <h4 style={{color: '#007bff', fontWeight: 'bold'}}>QuickMart</h4>
                <p className='mt-3'>Your one-stop destination for everything you need. Shop smart and discover quality products at unbeatable prices with fast delivery.</p>
              </div>
            </div>
            <div className="col-lg-2">
              <div className="footer-widget">
                <h4>Shop</h4>
                <ul className="footer-links ps-0">
                  <li><a href="">New Arrivals</a></li>
                  <li><a href="">Bestsellers</a></li>
                  <li><a href="">Women's Clothing</a></li>
                  <li><a href="">Men's Clothing</a></li>
                  <li><a href="">Accessories</a></li>
                  <li><a href="">Sale</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-2">
              <div className="footer-widget">
              <h4>Support</h4>
              <ul className="footer-links ps-0">
                <li><a href="">Help Center</a></li>
                <li><a href="">Order Status</a></li>
                <li><a href="">Shipping Info</a></li>
                <li><a href="">Returns &amp; Exchanges</a></li>
                <li><a href="#">Size Guide</a></li>
                <li><a href="">Contact Us</a></li>
              </ul>
            </div>
            </div>
            <div className="col-lg-2">
              <div className="footer-widget">
              <h4>Company</h4>
              <ul className="footer-links ps-0">
                <li><a href="">About Us</a></li>
                <li><a href="">Careers</a></li>
                <li><a href="">Press</a></li>
                <li><a href="">Affiliates</a></li>
                <li><a href="">Responsibility</a></li>
                <li><a href="">Investors</a></li>
              </ul>
            </div>
            </div>
            <div className="col-lg-2">
              <div className="footer-widget">
                <h4>Connect</h4>
                <ul className="footer-links ps-0">
                  <li><a href="">Newsletter</a></li>
                  <li><a href="">Social Media</a></li>
                  <li><a href="">Blog</a></li>
                  <li><a href="">Reviews</a></li>
                  <li><a href="">Community</a></li>
                  <li><a href="">Events</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Footer