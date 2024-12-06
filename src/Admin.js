import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function Admin() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', score: '' });

  // Öğrenci güncellemelerini almak için socket.io dinleyicisi
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

  // Öğrenci işlemleri
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

  return (
    <div style={{ padding: '20px' }}>
      <h1>Group Management</h1>
      <div>
        <input
          type="text"
          name="name"
          value={newStudent.name}
          onChange={handleNewStudentChange}
          placeholder="Group name"
        />
        <input
          type="number"
          name="score"
          value={newStudent.score}
          onChange={handleNewStudentChange}
          placeholder="Score"
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
                <button style={{backgroundColor:"#de2c47"}} onClick={() => handleDeleteStudent(student.name)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
