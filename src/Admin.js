import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Admin() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', score: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    axios.get('http://localhost:3001/api/students')
      .then((response) => setStudents(response.data))
      .catch((error) => console.error('Error fetching students:', error));

    socket.on('studentsUpdated', (updatedStudents) => setStudents(updatedStudents));
    socket.on('allMessages', (allMessages) => setMessages(allMessages));
    socket.on('receiveMessage', (message) => setMessages((prev) => [...prev, message]));

    return () => {
      socket.off('studentsUpdated');
      socket.off('allMessages');
      socket.off('receiveMessage');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      {/* Grup Yönetimi */}
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

      {/* Mesajlaşma Bölümü */}
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
            <p key={idx}><strong>{msg.username}:</strong> <span style={{backgroundColor: "#6fe173",padding: "4px 5px",borderRadius: "8px"}}>{msg.text}</span></p>
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
