"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import axios from "axios";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("month"); // "month" or "week"
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    color: "#0f6cbf",
  });
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // 1. Try to fetch from backend API
        const response = await axios.get("http://localhost:5000/api/goals");
        const apiGoals = response.data.map((goal) => ({
          ...goal,
          date: new Date(goal.date), // ensure date format is correct
        }));

        // Save to localStorage
        localStorage.setItem("calendar-goals", JSON.stringify(apiGoals));

        // Update state
        setGoals(apiGoals);
      } catch (apiErr) {
        console.warn(
          "Failed to fetch from API. Loading from localStorage...",
          apiErr
        );

        // 2. Fallback to localStorage if API fails
        const savedGoals = localStorage.getItem("calendar-goals");
        if (savedGoals) {
          try {
            const parsedGoals = JSON.parse(savedGoals).map((goal) => ({
              ...goal,
              date: new Date(goal.date),
            }));
            setGoals(parsedGoals);
          } catch (parseErr) {
            console.error(
              "Error parsing saved goals from localStorage:",
              parseErr
            );
          }
        }
      }
    };

    fetchGoals();
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calendar-goals", JSON.stringify(goals));
  }, [goals]);

  // Mock event data - replace with your API call
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch quizzes and exams from your API
        const quizResponse = await axios.get("http://localhost:5000/quiz/get");
        const examResponse = await axios.get(
          "http://localhost:5000/Exam/getall"
        );

        // Log the response data to inspect its structure
        console.log("Quiz Response:", quizResponse.data);
        console.log("Exam Response:", examResponse.data);

        if (!Array.isArray(quizResponse.data)) {
          throw new Error("Quizzes data is not an array");
        }

        if (!Array.isArray(examResponse.data.exams)) {
          throw new Error("Exams data is not an array");
        }

        // Map the quiz data to events
        const quizEvents = quizResponse.data.map((quiz) => ({
          id: `quiz-${quiz._id}`,
          title: quiz.quizName,
          date: new Date(), // Replace with quiz date logic if available
          type: "quiz",
          course: quiz.description,
          description: `Quiz: ${quiz.quizName}`,
          url: `/quiz/${quiz._id}`,
        }));

        // Map the exam data to events, ensure date is converted to a Date object
        const examEvents = examResponse.data.exams.map((exam) => ({
          id: `exam-${exam._id}`,
          title: exam.title,
          date: new Date(exam.startDate), // Ensure it's a Date object
          type: "exam",
          course: exam.title,
          description: `Exam: ${exam.title}`,
          url: `/exams/${exam._id}`,
        }));

        // Combine both quiz and exam events into one list
        const allEvents = [...quizEvents, ...examEvents];

        // Set the events state
        setEvents(allEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load calendar events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate.getMonth()]);

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Helper functions for calendar rendering
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  // Get goals for a specific date
  const getGoalsForDate = (date) => {
    return goals.filter((goal) => {
      if (!goal.date || typeof goal.date.getDate !== "function") {
        console.error("Invalid date object:", goal.date);
        return false;
      }

      return (
        goal.date.getDate() === date.getDate() &&
        goal.date.getMonth() === date.getMonth() &&
        goal.date.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get events and goals for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);
  const selectedDateGoals = getGoalsForDate(selectedDate);

  // Check if a date has events or goals
  const hasEventsOrGoals = (date) => {
    return (
      events.some(
        (event) =>
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear()
      ) ||
      goals.some(
        (goal) =>
          goal.date.getDate() === date.getDate() &&
          goal.date.getMonth() === date.getMonth() &&
          goal.date.getFullYear() === date.getFullYear()
      )
    );
  };

  // Format time (e.g., "14:30" -> "2:30 PM")
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Check if a date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Add a new goal
  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    const goalDate = new Date(selectedDate);

    const goal = {
      title: newGoal.title,
      description: newGoal.description,
      date: goalDate,
      color: newGoal.color,
      completed: false,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/goals", goal);
      const savedGoal = res.data;

      // Convert the date string back to a Date object
      savedGoal.date = new Date(savedGoal.date);

      // Add the saved goal (with its ID from MongoDB) to local state
      setGoals([...goals, savedGoal]);

      // Reset the form
      setNewGoal({ title: "", description: "", color: "#0f6cbf" });
      setShowGoalForm(false);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  // Update an existing goal
  const handleUpdateGoal = async () => {
    if (!editingGoal || !newGoal.title.trim()) return;

    const updatedGoal = {
      ...editingGoal,
      title: newGoal.title,
      description: newGoal.description,
      color: newGoal.color,
    };

    try {
      await axios.put(
        `http://localhost:5000/api/goals/${editingGoal._id}`,
        updatedGoal
      );

      const updatedGoals = goals.map((goal) =>
        goal._id === editingGoal._id
          ? {
              ...goal,
              title: newGoal.title,
              description: newGoal.description,
              color: newGoal.color,
            }
          : goal
      );

      setGoals(updatedGoals);
      setEditingGoal(null);
      setNewGoal({ title: "", description: "", color: "#0f6cbf" });
      setShowGoalForm(false);
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    if (!goalId) {
      console.warn("No goal ID provided");
      return;
    }
    try {
      console.log(`Deleting goal with ID: ${goalId}`); // Debug line
      await axios.delete(`http://localhost:5000/api/goals/${goalId}`); // Ensure the correct endpoint
      setGoals(goals.filter((goal) => goal._id !== goalId)); // Ensure you're using _id
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  // Toggle goal completion status
  const toggleGoalCompletion = async (goalId) => {
    // Ensure you're using the correct field to find the goal (e.g., _id)
    const goalToUpdate = goals.find((goal) => goal._id === goalId); // Make sure to use _id
    if (!goalToUpdate) return;

    const updatedGoal = {
      ...goalToUpdate,
      completed: !goalToUpdate.completed, // Toggle the completion status
    };

    try {
      // Use the goal's _id for the API request
      await axios.put(
        `http://localhost:5000/api/goals/${goalToUpdate._id}`,
        updatedGoal
      );

      // Update state to reflect the toggled completion status
      setGoals(
        goals.map(
          (goal) =>
            goal._id === goalId ? { ...goal, completed: !goal.completed } : goal // Use _id for comparison
        )
      );
    } catch (error) {
      console.error("Error toggling goal completion:", error);
    }
  };

  // Start editing a goal
  const startEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      color: goal.color,
    });
    setShowGoalForm(true);
  };

  // Get event type color
  const getEventColor = (type) => {
    switch (type) {
      case "assignment":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "quiz":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "exam":
        return "bg-red-100 text-red-800 border-red-200";
      case "session":
        return "bg-green-100 text-green-800 border-green-200";
      case "forum":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "meeting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "goal":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
        );
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
        );
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
        );
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
        );
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
        );
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
        );
      case "goal":
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
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        );
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
        );
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-10 md:h-24 bg-gray-50"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      const dateHasEventsOrGoals = hasEventsOrGoals(date);
      const isPast = isPastDate(new Date(year, month, day));

      days.push(
        <div
          key={day}
          className={`h-10 md:h-24 p-1 border border-gray-100 ${
            isToday ? "bg-blue-50" : isPast ? "bg-gray-50" : ""
          } hover:bg-gray-50 cursor-pointer relative`}
          onClick={() => setSelectedDate(new Date(year, month, day))}
        >
          <div className="flex justify-between items-start">
            <div
              className={`flex justify-center md:justify-start items-center h-6 w-6 md:mb-1 rounded-full ${
                isSelected
                  ? "bg-[#0f6cbf] text-white"
                  : isToday
                  ? "bg-blue-100 text-blue-800"
                  : ""
              }`}
            >
              {day}
            </div>

            {/* Add goal button - only visible for current and future dates */}
            {!isPast && (
              <button
                className="hidden md:flex h-6 w-6 items-center justify-center text-gray-400 hover:text-[#0f6cbf] hover:bg-blue-50 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(new Date(year, month, day));
                  setShowGoalForm(true);
                  setEditingGoal(null);
                  setNewGoal({ title: "", description: "", color: "#0f6cbf" });
                }}
                title="Add goal"
              >
                <PlusCircle size={14} />
              </button>
            )}
          </div>

          {dateHasEventsOrGoals && (
            <div className="hidden md:block">
              {/* Show goals first */}
              {getGoalsForDate(date)
                .slice(0, 1)
                .map((goal, index) => (
                  <div
                    key={`goal-${index}`}
                    className="text-xs truncate mb-1 px-1 py-0.5 rounded flex items-center"
                    style={{
                      backgroundColor: `${goal.color}20`,
                      color: goal.color,
                      borderColor: `${goal.color}40`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: goal.color }}
                    ></div>
                    <span className={goal.completed ? "line-through" : ""}>
                      {goal.title}
                    </span>
                  </div>
                ))}

              {/* Then show events */}
              {getEventsForDate(date)
                .slice(0, 1)
                .map((event, index) => (
                  <div
                    key={`event-${index}`}
                    className={`text-xs truncate mb-1 px-1 py-0.5 rounded ${getEventColor(
                      event.type
                    )}`}
                  >
                    {event.title}
                  </div>
                ))}

              {/* Show count of additional items */}
              {getEventsForDate(date).length + getGoalsForDate(date).length >
                2 && (
                <div className="text-xs text-gray-500 pl-1">
                  +
                  {getEventsForDate(date).length +
                    getGoalsForDate(date).length -
                    2}{" "}
                  more
                </div>
              )}
            </div>
          )}

          {dateHasEventsOrGoals && (
            <div className="absolute bottom-1 right-1 md:hidden">
              <div className="w-2 h-2 bg-[#0f6cbf] rounded-full"></div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Render week view
  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());

    const days = [];

    // Create 7 days (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      const isPast = isPastDate(new Date(date));
      const dayEvents = getEventsForDate(date);
      const dayGoals = getGoalsForDate(date);

      days.push(
        <div
          key={i}
          className="border-r border-gray-200 last:border-r-0 flex-1 min-w-[100px]"
        >
          <div
            className={`text-center py-2 border-b cursor-pointer ${
              isSelected
                ? "bg-[#0f6cbf] text-white"
                : isToday
                ? "bg-blue-50"
                : ""
            }`}
            onClick={() => setSelectedDate(new Date(date))}
          >
            <div className="text-xs uppercase">
              {date.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div
              className={`text-lg font-semibold ${
                isToday && !isSelected ? "text-[#0f6cbf]" : ""
              }`}
            >
              {date.getDate()}
            </div>

            {/* Add goal button - only visible for current and future dates */}
            {!isPast && (
              <button
                className="mt-1 inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(new Date(date));
                  setShowGoalForm(true);
                  setEditingGoal(null);
                  setNewGoal({ title: "", description: "", color: "#0f6cbf" });
                }}
              >
                <PlusCircle size={12} className="mr-1" />
                Goal
              </button>
            )}
          </div>

          <div className="h-[500px] overflow-y-auto p-1">
            {/* Display goals first */}
            {dayGoals.length > 0 && (
              <div className="mb-2">
                {dayGoals
                  .sort((a, b) => a.completed - b.completed)
                  .map((goal, index) => (
                    <div
                      key={`goal-${index}`}
                      className="mb-2 p-2 text-xs rounded border flex flex-col"
                      style={{
                        backgroundColor: `${goal.color}10`,
                        borderColor: `${goal.color}40`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="font-semibold flex items-center"
                          style={{ color: goal.color }}
                        >
                          <div
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: goal.color }}
                          ></div>
                          <span
                            className={goal.completed ? "line-through" : ""}
                          >
                            Goal
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGoalCompletion(goal._id);
                            }}
                            className="p-0.5 rounded hover:bg-gray-100"
                            title={
                              goal.completed
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            <Check
                              size={14}
                              className={
                                goal.completed
                                  ? "text-green-500"
                                  : "text-gray-400"
                              }
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditGoal(goal);
                            }}
                            className="p-0.5 rounded hover:bg-gray-100"
                            title="Edit goal"
                          >
                            <Edit size={14} className="text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGoal(goal._id);
                            }}
                            className="p-0.5 rounded hover:bg-gray-100"
                            title="Delete goal"
                          >
                            <Trash2 size={14} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`font-medium mt-1 ${
                          goal.completed ? "line-through text-gray-500" : ""
                        }`}
                        style={{ color: goal.color }}
                      >
                        {goal.title}
                      </div>
                      {goal.description && (
                        <div
                          className={`text-xs mt-1 ${
                            goal.completed
                              ? "line-through text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {goal.description}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Then display events */}
            {dayEvents.length > 0 ? (
              dayEvents
                .sort((a, b) => a.date - b.date)
                .map((event, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 text-xs rounded border ${getEventColor(
                      event.type
                    )}`}
                  >
                    <div className="font-semibold">
                      {formatTime(event.date)}
                    </div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs opacity-75">{event.course}</div>
                  </div>
                ))
            ) : dayGoals.length === 0 ? (
              <div className="text-center text-gray-400 text-xs mt-4">
                No events
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    return <div className="flex overflow-x-auto">{days}</div>;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto flex justify-center items-center text-center py-4">
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
              {currentDate.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              {/* Previous Month Button */}
              <button
                onClick={goToPreviousMonth}
                aria-label="Previous month"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  padding: "8px",
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  marginRight: "8px",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e5e7eb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronLeft size={20} style={{ color: "#4b5563" }} />
              </button>

              {/* Today Button */}
              <button
                onClick={goToToday}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "4px",
                  backgroundColor: "#0f6cbf",
                  color: "white",
                  fontWeight: "500",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  marginRight: "8px",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0a5699")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0f6cbf")
                }
              >
                Today
              </button>

              {/* Next Month Button */}
              <button
                onClick={goToNextMonth}
                aria-label="Next month"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  padding: "8px",
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  marginRight: "16px",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e5e7eb")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronRight size={20} style={{ color: "#4b5563" }} />
              </button>

              {/* Divider and View Controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderLeft: "1px solid #e5e7eb",
                  paddingLeft: "16px",
                  height: "36px",
                }}
                data-view-controls
              >
                <button
                  onClick={() => setView("month")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "36px",
                    minWidth: "80px",
                    padding: "0 16px",
                    borderRadius: "4px",
                    backgroundColor:
                      view === "month" ? "#0f6cbf" : "transparent",
                    color: view === "month" ? "white" : "#4b5563",
                    fontWeight: "500",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                    marginRight: "8px",
                  }}
                  onMouseOver={(e) => {
                    if (view !== "month") {
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (view !== "month") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  Month
                </button>
                <button
                  onClick={() => setView("week")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "36px",
                    minWidth: "80px",
                    padding: "0 16px",
                    borderRadius: "4px",
                    backgroundColor:
                      view === "week" ? "#0f6cbf" : "transparent",
                    color: view === "week" ? "white" : "#4b5563",
                    fontWeight: "500",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    if (view !== "week") {
                      e.currentTarget.style.backgroundColor = "#e5e7eb";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (view !== "week") {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
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
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="py-2 font-medium text-gray-500">
                      {day}
                    </div>
                  )
                )}
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
          <div className="bg-[#f8f9fa] border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0f6cbf]">
              Events for{" "}
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>

            {/* Add goal button - only visible for current and future dates */}
            {!isPastDate(new Date(selectedDate)) && (
              <button
                onClick={() => {
                  setShowGoalForm(true);
                  setEditingGoal(null);
                  setNewGoal({ title: "", description: "", color: "#0f6cbf" });
                }}
                className="flex items-center text-sm bg-[#0f6cbf] hover:bg-[#0a5699] text-white px-3 py-1.5 rounded"
              >
                <PlusCircle size={16} className="mr-1.5" />
                Add Goal
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Goal form */}
            {showGoalForm && (
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-blue-800">
                    {editingGoal ? "Edit Goal" : "Add New Goal"}
                  </h3>
                  <button
                    onClick={() => setShowGoalForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="goalTitle"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Goal Title*
                    </label>
                    <input
                      type="text"
                      id="goalTitle"
                      value={newGoal.title}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your goal"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="goalDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="goalDescription"
                      value={newGoal.description}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add details about your goal"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="goalColor"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="goalColor"
                        value={newGoal.color}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, color: e.target.value })
                        }
                        className="w-10 h-10 rounded border p-1"
                      />
                      <div
                        className="flex-1 px-3 py-2 rounded-md text-sm"
                        style={{
                          backgroundColor: `${newGoal.color}20`,
                          color: newGoal.color,
                          borderColor: `${newGoal.color}40`,
                        }}
                      >
                        Preview
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setShowGoalForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                      disabled={!newGoal.title.trim()}
                      className={`px-4 py-2 rounded-md text-white ${
                        newGoal.title.trim()
                          ? "bg-[#0f6cbf] hover:bg-[#0a5699]"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {editingGoal ? "Update Goal" : "Add Goal"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Goals for selected date */}
            {selectedDateGoals.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Goals
                </h3>
                <div className="space-y-3">
                  {selectedDateGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex border rounded-lg overflow-hidden"
                      style={{ borderColor: `${goal.color}40` }}
                    >
                      <div
                        className="w-2 flex-shrink-0"
                        style={{ backgroundColor: goal.color }}
                      ></div>
                      <div className="flex-1 p-3">
                        <div className="flex justify-between items-start">
                          <h4
                            className={`font-medium ${
                              goal.completed ? "line-through text-gray-500" : ""
                            }`}
                            style={{
                              color: goal.completed ? undefined : goal.color,
                            }}
                          >
                            {goal.title}
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginLeft: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                marginRight: "12px",
                              }}
                            >
                              <button
                                onClick={() => toggleGoalCompletion(goal._id)}
                                title={
                                  goal.completed
                                    ? "Mark as incomplete"
                                    : "Mark as complete"
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "40px",
                                  height: "40px",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  transition: "background-color 0.2s ease",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f3f4f6")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                                aria-label={
                                  goal.completed
                                    ? "Mark as incomplete"
                                    : "Mark as complete"
                                }
                              >
                                <Check
                                  size={18}
                                  style={{
                                    color: goal.completed
                                      ? "#10b981"
                                      : "#9ca3af",
                                  }}
                                />
                              </button>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#6b7280",
                                  marginTop: "2px",
                                  textAlign: "center",
                                }}
                              >
                                {goal.completed ? "Done" : "Complete"}
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                marginRight: "12px",
                              }}
                            >
                              <button
                                onClick={() => startEditGoal(goal)}
                                title="Edit goal"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "40px",
                                  height: "40px",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  transition: "background-color 0.2s ease",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f3f4f6")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                                aria-label="Edit goal"
                              >
                                <Edit size={18} style={{ color: "#9ca3af" }} />
                              </button>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#6b7280",
                                  marginTop: "2px",
                                  textAlign: "center",
                                }}
                              >
                                Edit
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <button
                                onClick={() => handleDeleteGoal(goal._id)}
                                title="Delete goal"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "40px",
                                  height: "40px",
                                  padding: "8px",
                                  borderRadius: "4px",
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  transition: "background-color 0.2s ease",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f3f4f6";
                                  e.currentTarget.querySelector(
                                    "svg"
                                  ).style.color = "#ef4444";
                                  e.currentTarget.parentNode.querySelector(
                                    "span"
                                  ).style.color = "#ef4444";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                  e.currentTarget.querySelector(
                                    "svg"
                                  ).style.color = "#9ca3af";
                                  e.currentTarget.parentNode.querySelector(
                                    "span"
                                  ).style.color = "#6b7280";
                                }}
                                aria-label="Delete goal"
                              >
                                <Trash2
                                  size={18}
                                  style={{
                                    color: "#9ca3af",
                                    transition: "color 0.2s ease",
                                  }}
                                />
                              </button>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#6b7280",
                                  marginTop: "2px",
                                  textAlign: "center",
                                  transition: "color 0.2s ease",
                                }}
                              >
                                Delete
                              </span>
                            </div>
                          </div>
                        </div>
                        {goal.description && (
                          <p
                            className={`text-sm mt-1 ${
                              goal.completed
                                ? "line-through text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events for selected date */}
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Events
                </h3>
                {selectedDateEvents
                  .sort((a, b) => a.date - b.date)
                  .map((event) => (
                    <div key={event.id} className="flex">
                      <div className="w-20 flex-shrink-0 text-right pr-4 text-gray-500">
                        {formatTime(event.date)}
                      </div>
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
                            event.type
                          )}`}
                        >
                          <span className="mr-1">
                            {getEventIcon(event.type)}
                          </span>
                          <span className="capitalize">{event.type}</span>
                        </div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                        <p className="text-sm text-[#0f6cbf] mt-1">
                          {event.course}
                        </p>
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
            ) : selectedDateGoals.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-[#0f6cbf] mb-3">
                  <CalendarIcon size={40} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium">
                  No events or goals for this day
                </h3>
                <p className="text-gray-500 mt-1">
                  {isPastDate(new Date(selectedDate))
                    ? "This date is in the past. You can only add goals for current and future dates."
                    : "Select a different date or add a new goal"}
                </p>

                {!isPastDate(new Date(selectedDate)) && (
                  <button
                    onClick={() => {
                      setShowGoalForm(true);
                      setEditingGoal(null);
                      setNewGoal({
                        title: "",
                        description: "",
                        color: "#0f6cbf",
                      });
                    }}
                    className="mt-4 px-4 py-2 bg-[#0f6cbf] text-white rounded-lg hover:bg-[#0a5699] inline-flex items-center"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Add Goal
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Event type legend */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          <div className="bg-[#f8f9fa] border-b px-6 py-3">
            <h2 className="font-medium text-[#0f6cbf]">Event Types</h2>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {[
              {
                type: "goal",
                label: "Goal",
                className: "bg-teal-100 text-teal-800 border-teal-200",
              },
              {
                type: "assignment",
                label: "Assignment",
                className: "bg-orange-100 text-orange-800 border-orange-200",
              },
              {
                type: "quiz",
                label: "Quiz",
                className: "bg-purple-100 text-purple-800 border-purple-200",
              },
              {
                type: "exam",
                label: "Exam",
                className: "bg-red-100 text-red-800 border-red-200",
              },
              {
                type: "session",
                label: "Live Session",
                className: "bg-green-100 text-green-800 border-green-200",
              },
              {
                type: "forum",
                label: "Forum",
                className: "bg-blue-100 text-blue-800 border-blue-200",
              },
              {
                type: "meeting",
                label: "Meeting",
                className: "bg-yellow-100 text-yellow-800 border-yellow-200",
              },
            ].map((item) => (
              <div
                key={item.type}
                className={`flex items-center px-2 py-1 rounded ${item.className}`}
              >
                <span className="mr-1">{getEventIcon(item.type)}</span>
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
