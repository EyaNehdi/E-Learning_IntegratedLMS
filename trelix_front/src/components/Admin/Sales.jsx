import React from 'react'
import styled from "styled-components";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { AiOutlineCaretDown } from "react-icons/ai";

function Sales() {
    return (
        <Section>
        <div className="sales">
      <div className="sales__details">
        <div>
          <h4>Sales Overview</h4>
         
        </div>
        <div>
         
          <button>
          Monthly
          <AiOutlineCaretDown />
          </button>
        </div>
      </div>
      <div className="sales__graph">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 10,
            }}
          >
            <defs>
              <linearGradient id="colorview" x1="0" y1="0" x2="0" y2="1">
                <stop offset="30%" stopColor="#668DFF" stopOpacity={0.4} />
                <stop offset="85%" stopColor="#D4E0FF" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <Tooltip cursor={false} />
            <Area
              type="monotone"
              dataKey="data2"
              stroke="#668DFF"
              fill="url(#colorview)"
            />
            <Area
              type="monotone"
              dataKey="data1"
              stroke="#668DFF"
              fill="url(#colorview)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
        </div>
        </Section>
    )
}

export default Sales
const data = [
    {
      data2: 2000,
      data1: 2400,
    },
    {
      data2: 4000,
      data1: 1398,
    },
    {
      data2: 5000,
      data1: 12800,
    },
    {
      data2: 8780,
      data1: 3908,
    },
    {
      data2: 9890,
      data1: 4800,
    },
    {
      data2: 11390,
      data1: 3800,
    },
    {
      data2: 3490,
      data1: 4300,
    },
  ];
  const Section = styled.section`
  .sales {
    color: black;
    width: 100%;
    .sales__details {
      display: flex;
      justify-content: space-between;
      margin: 1rem 0;
      div {
        display: flex;
        gap: 1rem;
        button {
          border-radius: 0.5rem;
          padding: 0.4rem 1rem;
          border: none;
          cursor: pointer;
          background-color: #EEF4FF;
            color: black;
            svg {
                font-size: 0.6rem;
            }
        }
      }
    }
    .sales__graph {
      height: 10rem;
      width: 100%;
      .recharts-default-tooltip {
      background-color: black !important;
      border-color: black !important;
      color : white !important;
    }
    }
  }
  `;