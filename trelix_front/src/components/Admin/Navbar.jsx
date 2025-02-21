import React from "react";
import styled from "styled-components";
import { BiSearch } from "react-icons/bi";
import { AiOutlineCalendar } from "react-icons/ai";
import { AiOutlineBell } from "react-icons/ai";
import { AiOutlineCaretDown } from "react-icons/ai";
function Navbar() {
  return (
    <Nav>
      <div className="title">
        <h1>Dashboard</h1>
      </div>
      <div className="notification">
        <div className="date">
          <AiOutlineCalendar />
          <span>Jan 30, 2022</span>
        </div>
        <div className="icon">
          <BiSearch />
          <span>|</span>
          <AiOutlineBell />
          <span>|</span>
          <div className="image">
            <img src="/assets/avatar.jpg" alt="" />
          </div>
          <AiOutlineCaretDown />
        </div>
      </div>
    </Nav>
  );
}

export default Navbar;
const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  color: white;
  .title {
    h1 {
      margin-left: 0.5rem;
      color: black;
      font-weight: bold;
      margin-top: 1rem;
    }
  }
  .notification {
    display: flex;
    align-items: center;
    margin-top: -10px;
    .date {
      background-color: #f8f9fe;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 1rem;
      svg {
        color: black;
      }
      span {
        color: black;
      }
    }
    .icon {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      svg {
        color: black;
      }
      span {
        color: black;
      }
      .image {
        display: flex;
        gap: 1rem;
        img {
          height: 2.5rem;
          width: 2.5rem;
          border-radius: 3rem;
        }
      }
    }
  }
`;
