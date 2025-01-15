import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

//const url = `http://localhost:3001`; // veya backend URL'niz
const url = `https://groupranking-timer-backend.onrender.com`;

const socket = io(url);

function GroupRanking() {
    const [students, setStudents] = useState([]);

    // İlk veri alma ve socket.io ile güncellemeleri dinleme
    useEffect(() => {
        // Başlangıçta öğrenci verisini alıyoruz
        axios.get(`${url}/api/students`)
            .then((response) => setStudents(response.data))
            .catch((error) => console.error('Error fetching students:', error));

        // Socket üzerinden öğrenci verisi güncellenirse veriyi güncelliyoruz
        socket.on('studentsUpdated', (updatedStudents) => {
            setStudents(updatedStudents);
        });

        // Component unmount olduğunda socket'i temizliyoruz
        return () => {
            socket.off('studentsUpdated');
        };
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
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
        </div>
    );
}

export default GroupRanking;
