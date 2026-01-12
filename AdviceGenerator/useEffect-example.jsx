import { useState, useEffect } from "react";

// Example Component to demonstrate useEffect
export default function CounterWithTimer() {
  const [count, setCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // ============================================
  // EXAMPLE 1: Run ONCE when component mounts
  // ============================================
  useEffect(() => {
    console.log("Component just mounted! This runs only once.");
    // This is like saying: "When this component first appears, do this"
  }, []); // Empty array = run only once

  // ============================================
  // EXAMPLE 2: Run EVERY TIME component renders
  // ============================================
  useEffect(() => {
    console.log("Component rendered! Count is:", count);
    // This runs after EVERY render (when count changes, when anything changes)
  }); // No array = run every time

  // ============================================
  // EXAMPLE 3: Run when SPECIFIC value changes
  // ============================================
  useEffect(() => {
    console.log("Count changed to:", count);
    // This ONLY runs when 'count' changes
  }, [count]); // Array with 'count' = run when count changes

  // ============================================
  // EXAMPLE 4: Timer that starts/stops
  // ============================================
  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      // Start a timer when isRunning becomes true
      intervalId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
      console.log("Timer started!");
    }

    // Cleanup function - runs when:
    // 1. Component unmounts (removed from page)
    // 2. Before the effect runs again (if dependencies change)
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Timer stopped!");
      }
    };
  }, [isRunning]); // Run when isRunning changes

  // ============================================
  // EXAMPLE 5: Update document title
  // ============================================
  useEffect(() => {
    document.title = `Count: ${count} | Timer: ${seconds}s`;
    // This updates the browser tab title whenever count or seconds change
  }, [count, seconds]); // Run when count OR seconds changes

  return (
    <div style={{ padding: "20px" }}>
      <h1>useEffect Examples</h1>
      
      <div>
        <h2>Count: {count}</h2>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
      </div>

      <div>
        <h2>Timer: {seconds} seconds</h2>
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Stop" : "Start"} Timer
        </button>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0" }}>
        <p><strong>Open the browser console to see useEffect logs!</strong></p>
        <p>Watch how different useEffect hooks run at different times.</p>
      </div>
    </div>
  );
}
