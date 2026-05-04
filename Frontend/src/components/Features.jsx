import React from 'react'
import { FaHeadset, FaMoneyBill, FaPercent, FaTruck } from "react-icons/fa6";

const Features = () => {
  return (
    <>
        <section className='features-section my-5'>
            <div className="container">
                <div className="row text-center ">
                <div className="col-lg-3">
                    <FaTruck className='icon' />
                    <h3>Free Shipping</h3>
                    <p>Enjoy free delivery on orders over $50. Fast and reliable shipping straight to your doorstep with no hidden charges.</p>
                </div>

                <div className="col-lg-3">
                    <FaMoneyBill className='icon' />
                    <h3>Money Back</h3>
                    <p>100% money-back guarantee within 30 days. Shop with confidence knowing your satisfaction is our priority.</p>
                </div>

                <div className="col-lg-3">
                    <FaPercent className='icon' />
                    <h3>Discount Offers</h3>
                    <p>Exclusive deals and seasonal discounts up to 70% off. Save more on your favorite products across all categories.</p>
                </div>

                <div className="col-lg-3">
                    <FaHeadset className='icon' />
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock customer support via chat, phone, or email. Our friendly team is always here to help you.</p>
                </div>
            </div>
            </div>
        </section>
    </>
  )
}

export default Features