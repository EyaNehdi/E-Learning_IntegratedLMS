import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import { AiOutlineAppstore } from "react-icons/ai";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { AiOutlineShopping } from "react-icons/ai";
import { AiOutlineLogout } from "react-icons/ai";
import { AiOutlineMessage } from "react-icons/ai";
import { AiOutlinePieChart } from "react-icons/ai";
import { AiOutlineSetting } from "react-icons/ai";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { AiFillCodeSandboxCircle } from "react-icons/ai";
import { SiAccusoft } from "react-icons/si";

function Sidebar() {
    const [currentLink, setCurrentLink] = useState(1);
    return (
        <Section>
            <div className="top">
            <div className="brand">
    <img src="../../../public/assets/images/logo.png" alt="AAE IdeaPro Logo" className="logo" />
   
</div>

                    <div className="links">
                        <ul>
                            <li
                            className={currentLink === 1 ? "active" : "none"}
                            onClick={() => setCurrentLink(1)}
                            >
                                <a href="#">
                                    <AiOutlineAppstore />
                                    <span className="border">Dashboard</span>
                                </a>
                            </li>
                            <li
                            className={currentLink === 2 ? "active" : "none"}
                            onClick={() => setCurrentLink(2)}
                            >
                                <a href="#">
                                    <AiOutlineShoppingCart />
                                    <span className="border">Orders</span>
                                </a>
                            </li>
                            <li
                            className={currentLink === 3 ? "active" : "none"}
                            onClick={() => setCurrentLink(3)}
                            >
                                <a href="#">
                                    <AiOutlineShopping />
                                    <span className="border">Products</span>
                                </a>
                            </li>
                            <li
                            className={currentLink === 4 ? "active" : "none"}
                            onClick={() => setCurrentLink(4)}
                            >
                                <a href="#">
                                    <AiOutlinePieChart />
                                    <span className="border">Overview</span>
                                </a>
                            </li>
                            <li
                            className={currentLink === 5 ? "active" : "none"}
                            onClick={() => setCurrentLink(5)}
                            >
                                <a href="#">
                                    <AiOutlineUsergroupAdd />
                                    <span className="border">Customers</span>
                                </a>
                            </li>
                            <li
                            className={currentLink === 6 ? "active" : "none"}
                            onClick={() => setCurrentLink(6)}
                            >
                                <a href="#">
                                    <AiOutlineMessage />
                                    <span className="border">Message</span>
                                </a>
                            </li>
                            <li
                            className={currentLink === 7 ? "active" : "none"}
                            onClick={() => setCurrentLink(7)}
                            >
                                <a href="#">
                                    <AiOutlineSetting />
                                    <span className="border">Settings</span>
                                </a>
                            </li>
                        </ul>
                    </div>
            </div>
            <div className="map">
            
    <img src="../../../public/assets/images/logo.png" alt="AAE IdeaPro Logo" className="logo" />
   
                <span>stay  <strong>tuned</strong>
                </span>
            </div>
            <div className="logout">
                <a href="#">
                    <AiOutlineLogout />
                    <span>Logout</span>
                </a>
            </div>
        </Section>
    )
}

export default Sidebar
const Section = styled.section`
position: fixed;
left: 0;
background-color: #F8F9EF;
height: 100vh;
width: 18vw;
display: flex;
flex-direction: column;
align-items: center;
justify-content: space-between;
padding: 2rem 0;
gap: 2rem;
.top{
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    .brand {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.3rem 0;
        svg {
            color: blue;
            font-size: 2rem;
        }
        span {
            font-size: 1.5rem;
            font-weight: bold;
            color: black;
        }
    }
    .links {
        display: flex;
        justify-content: center;
        ul {
            list-style-type: none;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            li{
                padding: 0.6rem 2rem;
                border-radius: 0.3rem;
                &:hover {
                    background-color: black;
                    a{
                        color: white;
                    }
                }
                a {
                    text-decoration: none;
                    display: flex;
                    gap: 1rem;
                    color: grey;
                    svg {
                        font-size: 1.4rem;
                    }
                    span {
                        display: flex;
                        gap: 2rem;
                    }
                }
            }
            .active {
                background-color: black;
                a {
                    color: white;
                }
            }
        }
    }
}
.map {
    width: 90%;
    display: flex;
    background-color:#EBECF1;
    padding-top: 10px;
    padding-bottom: 10px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: -25px;
    border-radius: 0.5rem;
    svg {
        color: blue;
        font-size: 2rem;
    }
}
.logout {
    padding: 0.6rem 3rem;
    margin-left: -2rem;
    a {
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        gap: 1rem;
        svg {
            font-size:1.4rem;
        }
        span {
            display: flex;
        }
    }
}
`
;
