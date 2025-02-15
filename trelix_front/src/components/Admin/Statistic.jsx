import React from 'react'
import styled from 'styled-components'
import { AiFillTag } from "react-icons/ai";
import { AiFillExperiment } from "react-icons/ai";
import { AiFillDollarCircle } from "react-icons/ai";
import { AiOutlineArrowUp } from "react-icons/ai";
import { AiOutlineArrowDown } from "react-icons/ai";
function Statistic() {
    return (
        <Section>
            <div className="analytic color1">
                <div className="design">
                    <div className="logo">
                        <AiFillTag />
                    </div>
                    <div className="content">
                        <h5>$123,456,789</h5>
                    </div>
                </div>
                <div className="total">
                    <h6>TOTAL SALES</h6>
                    <span className="t1">+18%</span>
                    <AiOutlineArrowUp className="svg1" />
                </div>
            </div>
            <div className="analytic color2">
                <div className="design">
                    <div className="logo">
                        <AiFillExperiment />
                    </div>
                    <div className="content">
                        <h5>$123,456,345</h5>
                    </div>
                </div>
                <div className="total">
                    <h6>TOTAL EXPENSES</h6>
                    <span className="t2">-9%</span>
                    <AiOutlineArrowDown className="svg2" />
                </div>
            </div>
            <div className="analytic color3">
                <div className="design">
                    <div className="logo">
                        <AiFillDollarCircle />
                    </div>
                    <div className="content">
                        <h5>$123,456,876</h5>
                    </div>
                </div>
                <div className="total">
                    <h6>TOTAL REVENUE</h6>
                    <span className="t1">+24%</span>
                    <AiOutlineArrowUp className="svg1" />
                </div>
            </div>
        </Section>
    )
}

export default Statistic
const Section = styled.section `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    .color1 {
        background-color: #EEF4FF;
    }
    .color2{
        background-color: #FDF4F5;
    }
    .color3{
        background-color: #FFFCE4;
    }
    .analytic {
        padding: 1rem 2rem 1rem 2rem;
        border-radius: 1rem;
        color: black;
        justify-content: space-evenly;
        align-items: center;
        gap: 1rem;
        transition: 0.5s ease-in-out;
        &:hover {
            background-color: #D4E0FF;
            color: black;
            svg {
                color: black;
            }
        }
        .design{
            display: flex;
            align-items: center;
            gap: 1rem;
            .logo {
                background-color: white;
                border-radius: 1rem;
                border: 1px solid black;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 1.5rem;
                svg {
                    font-size: 1.5rem;
                }
            }
        }
        .total {
            display: flex;
            align-items: center;
            gap: 1rem;
            justify-content: space-evenly;
            margin-top: 20px;
            .svg1 {
                color: green;
            }
            .svg2 {
                color: red;
            }
            .t1 {
                color: green;
            }
            .t2{
                color: red;
            }
            h6{
                color: grey;
            }
        }
    }
`;
