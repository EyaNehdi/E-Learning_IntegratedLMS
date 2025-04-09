import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

const QuizProgressBar = ({ totalQuestions, answeredQuestions, onTimeUp }) => {
    const [progress, setProgress] = useState(0); // Tracks answered questions
    const [buffer, setBuffer] = useState(0); // Tracks ideal time progression

    const progressRef = useRef(() => {});

    useEffect(() => {
        progressRef.current = () => {
            if (buffer < 100) {
                setBuffer((prev) => Math.min(prev + (100 / 75), 100)); // Increase per second
            } else {
                onTimeUp(); // Auto-submit when time runs out
            }
        };
    }, [buffer, onTimeUp]);

    useEffect(() => {
        const timer = setInterval(() => {
            progressRef.current();
        }, 1000); // Progress every second

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setProgress((answeredQuestions / totalQuestions) * 100);
    }, [answeredQuestions, totalQuestions]);

    return (
        <Box sx={{ width: "100%", marginBottom: "10px" }}>
            <LinearProgress variant="buffer" value={progress} valueBuffer={buffer} />
        </Box>
    );
};

export default QuizProgressBar;
