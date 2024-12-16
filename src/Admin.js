import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Admin() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', score: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
  const [inputMinutes, setInputMinutes] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    axios.get('http://localhost:3001/api/students')
      .then((response) => setStudents(response.data))
      .catch((error) => console.error('Error fetching students:', error));

    socket.on('studentsUpdated', (updatedStudents) => setStudents(updatedStudents));
    socket.on('allMessages', (allMessages) => setMessages(allMessages));
    socket.on('receiveMessage', (message) => setMessages((prev) => [...prev, message]));
    socket.on('timerUpdated', (updatedTimer) => setTimer(updatedTimer));

    return () => {
      socket.off('studentsUpdated');
      socket.off('allMessages');
      socket.off('receiveMessage');
      socket.off('timerUpdated');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer Control
  const handleStartTimer = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/start', { minutes: inputMinutes });
      setIsTimerRunning(true);
      setIsTimerPaused(false);
    } catch (error) {
      console.error('Timer start failed:', error);
    }
  };

  const handleStopTimer = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/stop');
      setIsTimerRunning(false);
      setIsTimerPaused(true);
    } catch (error) {
      console.error('Timer stop failed:', error);
    }
  };

  const handleResumeTimer = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/resume');
      setIsTimerPaused(false);
      setIsTimerRunning(true);
    } catch (error) {
      console.error('Timer resume failed:', error);
    }
  };

  const handleResetTimer = async () => {
    try {
      await axios.post('http://localhost:3001/api/timer/reset');
      setIsTimerRunning(false);
      setIsTimerPaused(false);
    } catch (error) {
      console.error('Timer reset failed:', error);
    }
  };

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || isNaN(newStudent.score)) {
      alert('Please enter a valid name and score.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/students', {
        name: newStudent.name,
        score: parseFloat(newStudent.score),
      });
      setNewStudent({ name: '', score: '' });
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleDeleteStudent = async (name) => {
    try {
      await axios.delete(`http://localhost:3001/api/students/${name}`);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleUpdateScore = async (name, newScore) => {
    if (isNaN(newScore)) return;
    try {
      await axios.put(`http://localhost:3001/api/students/${name}`, {
        score: parseFloat(newScore),
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleDeleteAllMessages = async () => {
    try {
      await axios.post('http://localhost:3001/api/messages/deleteAll');
      setMessages([]);
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const messageData = { username: 'Admin', text: newMessage };
      socket.emit('sendMessage', messageData);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '50px' }}>
      {/* Timer Section */}
      <div style={{ width: '300px' }}>
        <h1>Timer</h1>
        <input
          type="number"
          value={inputMinutes}
          onChange={(e) => setInputMinutes(e.target.value)}
          min="0"
          placeholder="Enter minutes"
        />
        {!isTimerRunning && !isTimerPaused && <button onClick={handleStartTimer}>Start Timer</button>}
        {isTimerRunning && !isTimerPaused && <button onClick={handleStopTimer}>Stop Timer</button>}
        {isTimerPaused && (
          <>
            <button onClick={handleResumeTimer}>Resume Timer</button>
            <button onClick={handleResetTimer}>Reset Timer</button>
          </>
        )}
        <h2 style={{ fontSize: "50px" }}>
          {timer.minutes}:{timer.seconds < 10 ? '0' + timer.seconds : timer.seconds}
        </h2>
      </div>

      {/* Group Management */}
      <div>
        <h1>Group Management</h1>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            name="name"
            value={newStudent.name}
            onChange={handleNewStudentChange}
            placeholder="Group name"
            style={{ marginRight: '10px' }}
          />
          <input
            type="number"
            name="score"
            value={newStudent.score}
            onChange={handleNewStudentChange}
            placeholder="Score"
            style={{ marginRight: '10px' }}
          />
          <button onClick={handleAddStudent}>Add Group</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.name}>
                <td>{student.name}</td>
                <td>
                  <input
                    type="number"
                    value={student.score}
                    onChange={(e) => handleUpdateScore(student.name, e.target.value)}
                  />
                </td>
                <td>
                  <button
                    style={{ backgroundColor: "#de2c47" }}
                    onClick={() => handleDeleteStudent(student.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Message Section */}
      <div>
        <h1>Messages</h1>
        <button
          onClick={handleDeleteAllMessages}
          style={{ backgroundColor: 'red', color: 'white', marginBottom: '10px' }}
        >
          Delete All Messages
        </button>

        <div style={{
          width: '400px', height: '200px', overflowY: 'auto',
          border: '1px solid #ccc', padding: '10px', marginBottom: '10px'
        }}>
          {messages.map((msg, idx) => (
            <p key={idx}><strong>{msg.username}:</strong> <span style={{ backgroundColor: "#6fe173", padding: "4px 5px", borderRadius: "8px" }}>{msg.text}</span></p>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{ width: '300px', padding: '10px' }}
          />
          <button onClick={handleSendMessage} style={{ padding: '10px', marginLeft: '10px' }}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
