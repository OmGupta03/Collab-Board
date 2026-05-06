import { useState, useRef, useEffect } from 'react';

export default function useTimer() {
    const [timerSecs, setTimerSecs] = useState(300);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerInput, setTimerInput] = useState("5");
    const timerRef = useRef(null);

    useEffect(() => {
        if (!timerRunning) {
            clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            setTimerSecs(s => {
                if (s <= 1) {
                    clearInterval(timerRef.current);
                    setTimerRunning(false);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timerRunning]);

    const startTimer = () => {
        const m = parseInt(timerInput) || 5;
        setTimerSecs(m * 60);
        setTimerRunning(true);
    };

    const resetTimer = () => {
        const m = parseInt(timerInput) || 5;
        setTimerSecs(m * 60);
        setTimerRunning(false);
    };

    return { timerSecs, timerRunning, timerInput, setTimerInput, setTimerRunning, startTimer, resetTimer };
}
