import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './App.css';

const socket = io('http://localhost:3001'); // Backend ile bağlantı

function App() {
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [inputMinutes, setInputMinutes] = useState(0);
  const [students, setStudents] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    socket.on('timerUpdated', (updatedTimer) => {
      setTimer(updatedTimer);
    });

    return () => {
      socket.off('timerUpdated');
    };
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/students')
      .then((response) => setStudents(response.data))
      .catch((error) => console.error('Error fetching students:', error));

    socket.on('studentsUpdated', (updatedStudents) => {
      setStudents(updatedStudents);
    });

    return () => {
      socket.off('studentsUpdated');
    };
  }, []);

  const handleMinuteChange = (e) => {
    setInputMinutes(e.target.value);
  };

  const handleStart = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/start', {
        minutes: inputMinutes,
      });
      setIsTimerRunning(true);
      setIsTimerPaused(false);
    } catch (error) {
      console.error('Timer start failed:', error);
    }
  };

  const handleStop = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/stop');
      setIsTimerRunning(false);
      setIsTimerPaused(true);
    } catch (error) {
      console.error('Timer stop failed:', error);
    }
  };

  const handleResume = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/resume');
      setIsTimerPaused(false);
      setIsTimerRunning(true);
    } catch (error) {
      console.error('Timer resume failed:', error);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/reset');
      setIsTimerRunning(false);
      setIsTimerPaused(false);
    } catch (error) {
      console.error('Timer reset failed:', error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* Timer bölümü */}
        <div className="timer-section">
          <h1>Timer</h1>
          <div>
            <input
              type="number"
              value={inputMinutes}
              onChange={handleMinuteChange}
              min="0"
              placeholder="Enter minutes"
            />
            {!isTimerRunning && !isTimerPaused && (
              <button onClick={handleStart}>Start Timer</button>
            )}
            {isTimerRunning && !isTimerPaused && (
              <button onClick={handleStop}>Stop Timer</button>
            )}
            {isTimerPaused && (
              <>
                <button onClick={handleResume}>Continue</button>
                <button onClick={handleReset}>Reset Timer</button>
              </>
            )}
          </div>
          <h1 style={{fontSize:"100px"}}>
            {timer.minutes}:{timer.seconds < 10 ? '0' + timer.seconds : timer.seconds}
          </h1>
        </div>

        {/* Grup Sıralaması */}
        <div className="group-ranking-section">
          <h1>Groepsranglijst</h1>
          <table>
            <thead>
              <tr>
                <th>Groep</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.name}>
                  <td>{student.name}</td>
                  <td>{student.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
