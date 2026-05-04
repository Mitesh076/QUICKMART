import React, { useEffect, useState } from 'react'
import Button from './Button'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Banner = () => {

    const [data,setData] = useState("")
    useEffect(() => {
        axios.get("http://localhost:3000/api")
            .then((res) => setData(res.data))
            .catch((error) => {})
    }, [])


    return (
        <>
            <section className='banner-section'>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="content">
                                <span className="promo-badge">New Collection 2025</span>
                                <h1>Discover Amazing <span>Products</span> For Every Need</h1>
                                <p>Explore our extensive collection featuring electronics, appliances, clothing, home goods, sports equipment, beauty products, and daily essentials. Quality products at great prices with fast delivery to your doorstep.</p>
                                <Link to="/products">
                                    <Button title={"Shop Now"} />
                                </Link>
                                <Button title={"View Collection"} />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="content-img position-relative">
                                <img src="https://bootstrapmade.com/content/demo/eStore/assets/img/product/product-f-9.webp" alt="Banner Img" className='img-fluid' />

                                <div className="floating-product">
                                    <div>
                                        <img src="https://bootstrapmade.com/content/demo/eStore/assets/img/product/product-4.webp" alt="" className='img-fluid' />
                                    </div>
                                    <div className="product-info">
                                        <h4>Summer Collection</h4>
                                        <span className="price">$89.99</span>
                                    </div>
                                </div>

                                <div className="floating-product-2">
                                    <div>
                                        <img src="https://bootstrapmade.com/content/demo/eStore/assets/img/product/product-4.webp" alt="" className='img-fluid' />
                                    </div>
                                    <div className="product-info">
                                        <h4>Summer Collection</h4>
                                        <span className="price">$89.99</span>
                                    </div>
                                </div>

                                <div className="discount">
                                    <span className="percent">30%</span>
                                    <span className="text">OFF</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Banner