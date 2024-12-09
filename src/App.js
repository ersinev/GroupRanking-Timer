import React, { useState, useEffect, useRef } from 'react';
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

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [nameSet, setNameSet] = useState(false);

  // İsimler için rastgele renk belirleyici
  const userColors = useRef({});

  // Scroll Referansı
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('timerUpdated', (updatedTimer) => setTimer(updatedTimer));
    return () => socket.off('timerUpdated');
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/students')
      .then((response) => setStudents(response.data))
      .catch((error) => console.error('Error fetching students:', error));

    socket.on('studentsUpdated', (updatedStudents) => setStudents(updatedStudents));
    return () => socket.off('studentsUpdated');
  }, []);

  useEffect(() => {
    socket.on("allMessages", (allMessages) => {
      setMessages(allMessages); // Tüm eski mesajları alıyoruz
    });
    socket.on("receiveMessage", (message) => {
      if (!userColors.current[message.username]) {
        userColors.current[message.username] = getRandomColor();
      }
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off("receiveMessage");
      socket.off("allMessages");
    };
  }, []);

  // Otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStart = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/start', { minutes: inputMinutes });
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

  const handleSetName = () => {
    if (username.trim() !== "") {
      setNameSet(true);
    } else {
      alert("Please enter a valid name.");
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && nameSet) {
      const messageData = { username, text: newMessage };
      socket.emit("sendMessage", messageData); 
      setNewMessage(""); 
    } else if (!nameSet) {
      alert("Please enter your name first.");
    }
  };
  
  // Enter tuşuna basıldığında mesaj gönder
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Enter tuşunun formu göndermesini engeller
      handleSendMessage(); // Mesajı gönder
    }
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="App">
      <h1>Cccccc</h1>

      <div className="container">
        <div className="timer-section">
          <h1>Timer</h1>
          <div>
            <input
              type="number"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              min="0"
              placeholder="Enter minutes"
            />
            {!isTimerRunning && !isTimerPaused && <button onClick={handleStart}>Start Timer</button>}
            {isTimerRunning && !isTimerPaused && <button onClick={handleStop}>Stop Timer</button>}
            {isTimerPaused && (
              <>
                <button onClick={handleResume}>Continue</button>
                <button onClick={handleReset}>Reset Timer</button>
              </>
            )}
          </div>
          <h1 style={{ fontSize: "100px" }}>
            {timer.minutes}:{timer.seconds < 10 ? '0' + timer.seconds : timer.seconds}
          </h1>
        </div>

        <div className="group-ranking-section">
          <h1>Groepsranglijst</h1>
          <table>
            <thead>
              <tr><th>Groep</th><th>Score</th></tr>
            </thead>
            <tbody style={{ fontSize: "20px", fontWeight: "600" }}>
              {students.map((student) => (
                <tr key={student.name}>
                  <td>{student.name}</td>
                  <td>{student.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="message-section">
          <h1>Messages</h1>
          {!nameSet ? (
            <div className="name-input-section">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
              />
              <button onClick={handleSetName}>Set Name</button>
            </div>
          ) : (
            <>
              <div className="messages-container">
                <div className="messages">
                  {messages.map((msg, idx) => (
                    <p key={idx} className="message-item">
                      <strong style={{ color: userColors.current[msg.username], marginRight:"3px" }}>
                        {msg.username}:
                      </strong> {msg.text}
                    </p>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="message-input-section fixed-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown} 
                  placeholder="Type a message..."
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
