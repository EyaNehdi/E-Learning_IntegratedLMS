"use client"

import { createContext, useState, useContext } from "react"

const TabsContext = createContext({
  value: "",
  onValueChange: () => {},
})

function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [tabValue, setTabValue] = useState(defaultValue || "")

  const contextValue = {
    value: value !== undefined ? value : tabValue,
    onValueChange: onValueChange || setTabValue,
  }

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ children, className = "" }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  )
}

function TabsTrigger({ value, children, className = "" }) {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isActive = selectedValue === value

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
      } ${className}`}
      onClick={() => onValueChange(value)}
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, children, className = "" }) {
  const { value: selectedValue } = useContext(TabsContext)
  const isActive = selectedValue === value

  if (!isActive) return null

  return (
    <div className={`mt-2 ${className}`} data-state={isActive ? "active" : "inactive"}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

