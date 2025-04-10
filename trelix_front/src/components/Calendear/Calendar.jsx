
import { useState, useEffect } from "react"

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState("month") // "month" or "week"

  // Mock event data - replace with your API call
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Replace with your actual API endpoint
        // const response = await fetch('http://localhost:5000/api/calendar/events');
        // if (!response.ok) throw new Error('Failed to fetch events');
        // const data = await response.json();

        // Mock data for demonstration
        const mockData = [
          {
            id: 1,
            title: "Assignment Due: Research Paper",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 23, 59),
            type: "assignment",
            course: "Biology 101",
            description: "Submit your research paper on ecosystem diversity",
            url: "#",
          },
          {
            id: 2,
            title: "Quiz: Chapter 5",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 14, 30),
            type: "quiz",
            course: "Mathematics",
            description: "Online quiz covering chapter 5 material",
            url: "#",
          },
          {
            id: 3,
            title: "Live Session: Q&A",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0),
            type: "session",
            course: "Physics 202",
            description: "Live Q&A session with Professor Johnson",
            url: "#",
          },
          {
            id: 4,
            title: "Forum Discussion Deadline",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 12, 0),
            type: "forum",
            course: "History 101",
            description: "Post your response to the weekly discussion topic",
            url: "#",
          },
          {
            id: 5,
            title: "Group Project Meeting",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3, 15, 30),
            type: "meeting",
            course: "Business Ethics",
            description: "Team meeting to discuss project progress",
            url: "#",
          },
          {
            id: 6,
            title: "Midterm Exam",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 5, 9, 0),
            type: "exam",
            course: "Computer Science",
            description: "Midterm examination covering all material to date",
            url: "#",
          },
        ]

        setEvents(mockData)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load calendar events. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [currentDate.getMonth()])

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Helper functions for calendar rendering
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate)

  // Check if a date has events
  const hasEvents = (date) => {
    return events.some(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Format time (e.g., "14:30" -> "2:30 PM")
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  }

  // Get event type color
  const getEventColor = (type) => {
    switch (type) {
      case "assignment":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "quiz":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      case "session":
        return "bg-green-100 text-green-800 border-green-200"
      case "forum":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "meeting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get event type icon
  const getEventIcon = (type) => {
    switch (type) {
      case "assignment":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        )
      case "quiz":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      case "exam":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        )
      case "session":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        )
      case "forum":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )
      case "meeting":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        )
    }
  }

  // Render calendar grid
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-24 bg-gray-50"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()
      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      const dateHasEvents = hasEvents(date)

      days.push(
        <div
          key={day}
          className={`h-10 md:h-24 p-1 border border-gray-100 ${
            isToday ? "bg-blue-50" : ""
          } hover:bg-gray-50 cursor-pointer relative`}
          onClick={() => setSelectedDate(date)}
        >
          <div
            className={`flex justify-center md:justify-start items-center h-6 w-6 md:mb-1 rounded-full ${
              isSelected ? "bg-[#0f6cbf] text-white" : isToday ? "bg-blue-100 text-blue-800" : ""
            }`}
          >
            {day}
          </div>
          {dateHasEvents && (
            <div className="hidden md:block">
              {getEventsForDate(date)
                .slice(0, 2)
                .map((event, index) => (
                  <div key={index} className={`text-xs truncate mb-1 px-1 py-0.5 rounded ${getEventColor(event.type)}`}>
                    {event.title}
                  </div>
                ))}
              {getEventsForDate(date).length > 2 && (
                <div className="text-xs text-gray-500 pl-1">+{getEventsForDate(date).length - 2} more</div>
              )}
            </div>
          )}
          {dateHasEvents && (
            <div className="absolute bottom-1 right-1 md:hidden">
              <div className="w-2 h-2 bg-[#0f6cbf] rounded-full"></div>
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  // Render week view
  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

    const days = []

    // Create 7 days (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)

      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()

      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()

      const dayEvents = events.filter(
        (event) =>
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear(),
      )

      days.push(
        <div key={i} className="border-r border-gray-200 last:border-r-0 flex-1 min-w-[100px]">
          <div
            className={`text-center py-2 border-b cursor-pointer ${
              isSelected ? "bg-[#0f6cbf] text-white" : isToday ? "bg-blue-50" : ""
            }`}
            onClick={() => setSelectedDate(date)}
          >
            <div className="text-xs uppercase">{date.toLocaleDateString(undefined, { weekday: "short" })}</div>
            <div className={`text-lg font-semibold ${isToday && !isSelected ? "text-[#0f6cbf]" : ""}`}>
              {date.getDate()}
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto p-1">
            {dayEvents.length > 0 ? (
              dayEvents
                .sort((a, b) => a.date - b.date)
                .map((event, index) => (
                  <div key={index} className={`mb-2 p-2 text-xs rounded border ${getEventColor(event.type)}`}>
                    <div className="font-semibold">{formatTime(event.date)}</div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">{event.course}</div>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-400 text-xs mt-4">No events</div>
            )}
          </div>
        </div>,
      )
    }

    return <div className="flex overflow-x-auto">{days}</div>
  }

  return (
    <div className="bg-gray-100 min-h-screen">
     

     <div className="container mx-auto flex justify-center items-center text-center">
  <h1 className="text-xl font-bold">Trelix Calendar</h1>
</div>

    

      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-[#f8f9fa] border-b px-6 py-4 flex flex-wrap justify-between items-center">
            <h2 className="text-xl font-bold text-[#0f6cbf]">
              {currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-gray-200"
                aria-label="Previous month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button onClick={goToToday} className="px-3 py-1 bg-[#0f6cbf] text-white rounded hover:bg-[#0a5699]">
                Today
              </button>
              <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-200" aria-label="Next month">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <div className="border-l pl-2 ml-2 hidden sm:block">
                <button
                  onClick={() => setView("month")}
                  className={`px-3 py-1 rounded ${view === "month" ? "bg-[#0f6cbf] text-white" : "hover:bg-gray-200"}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-3 py-1 rounded ml-1 ${
                    view === "week" ? "bg-[#0f6cbf] text-white" : "hover:bg-gray-200"
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(35)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : view === "month" ? (
            <div>
              {/* Calendar header - days of week */}
              <div className="grid grid-cols-7 text-center border-b">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">{renderCalendarDays()}</div>
            </div>
          ) : (
            <div>
              {/* Week view */}
              {renderWeekView()}
            </div>
          )}
        </div>

        {/* Timeline / Events for selected date */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#f8f9fa] border-b px-6 py-4">
            <h2 className="text-lg font-bold text-[#0f6cbf]">
              Events for{" "}
              {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </h2>
          </div>

          <div className="p-6">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents
                  .sort((a, b) => a.date - b.date)
                  .map((event) => (
                    <div key={event.id} className="flex">
                      <div className="w-20 flex-shrink-0 text-right pr-4 text-gray-500">{formatTime(event.date)}</div>
                      <div className="w-1 bg-gray-200 relative">
                        <div
                          className={`absolute w-3 h-3 rounded-full -left-1 top-1.5 border-2 border-white ${
                            event.type === "assignment"
                              ? "bg-orange-500"
                              : event.type === "quiz"
                                ? "bg-purple-500"
                                : event.type === "exam"
                                  ? "bg-red-500"
                                  : event.type === "session"
                                    ? "bg-green-500"
                                    : event.type === "forum"
                                      ? "bg-blue-500"
                                      : event.type === "meeting"
                                        ? "bg-yellow-500"
                                        : "bg-gray-500"
                          }`}
                        ></div>
                      </div>
                      <div className="pl-6 pb-6">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1 ${getEventColor(
                            event.type,
                          )}`}
                        >
                          <span className="mr-1">{getEventIcon(event.type)}</span>
                          <span className="capitalize">{event.type}</span>
                        </div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <p className="text-sm text-[#0f6cbf] mt-1">{event.course}</p>
                        <a
                          href={event.url}
                          className="inline-block mt-2 text-sm bg-[#0f6cbf] hover:bg-[#0a5699] text-white px-3 py-1 rounded"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-[#0f6cbf] mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No events for this day</h3>
                <p className="text-gray-500 mt-1">Select a different date or add a new event</p>
              </div>
            )}
          </div>
        </div>

        {/* Event type legend */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="bg-[#f8f9fa] border-b px-6 py-3">
            <h2 className="font-medium text-[#0f6cbf]">Event Types</h2>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            <div className="flex items-center px-2 py-1 rounded bg-orange-100 text-orange-800 border border-orange-200">
              <span className="mr-1">{getEventIcon("assignment")}</span>
              <span className="text-sm">Assignment</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200">
              <span className="mr-1">{getEventIcon("quiz")}</span>
              <span className="text-sm">Quiz</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">
              <span className="mr-1">{getEventIcon("exam")}</span>
              <span className="text-sm">Exam</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">
              <span className="mr-1">{getEventIcon("session")}</span>
              <span className="text-sm">Live Session</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">
              <span className="mr-1">{getEventIcon("forum")}</span>
              <span className="text-sm">Forum</span>
            </div>
            <div className="flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
              <span className="mr-1">{getEventIcon("meeting")}</span>
              <span className="text-sm">Meeting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
