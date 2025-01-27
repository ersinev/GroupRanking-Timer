import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

//const url = `http://localhost:3001`; // veya backend URL'niz
const url = `https://groupranking-timer-backend.onrender.com`;

const socket = io(url);


function GroupRanking() {
    const [students, setStudents] = useState([]);
    const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });
    // const [inputMinutes, setInputMinutes] = useState(0);
    // const [isTimerRunning, setIsTimerRunning] = useState(false);
    // const [isTimerPaused, setIsTimerPaused] = useState(false);

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

    // Fetch initial data
    useEffect(() => {
        axios.get(`${url}/api/students`)
            .then((response) => setStudents(response.data))
            .catch((error) => console.error('Error fetching students:', error));

        socket.on('timerUpdated', (updatedTimer) => setTimer(updatedTimer));

        return () => {
            socket.off('studentsUpdated');
            socket.off('allMessages');
            socket.off('receiveMessage');
            socket.off('timerUpdated');
        };
    }, []);



    // const handleStartTimer = async () => {
    //     try {
    //         await axios.post(`${url}/api/timer/start`, { minutes: inputMinutes });
    //         setIsTimerRunning(true);
    //         setIsTimerPaused(false);
    //     } catch (error) {
    //         console.error('Timer start failed:', error);
    //     }
    // };

    // const handleStopTimer = async () => {
    //     try {
    //         await axios.post(`${url}/api/timer/stop`);
    //         setIsTimerRunning(false);
    //         setIsTimerPaused(true);
    //     } catch (error) {
    //         console.error('Timer stop failed:', error);
    //     }
    // };

    // const handleResumeTimer = async () => {
    //     try {
    //         await axios.post(`${url}/api/timer/resume`);
    //         setIsTimerPaused(false);
    //         setIsTimerRunning(true);
    //     } catch (error) {
    //         console.error('Timer resume failed:', error);
    //     }
    // };

    // const handleResetTimer = async () => {
    //     try {
    //         await axios.post(`${url}/api/timer/reset`);
    //         setIsTimerRunning(false);
    //         setIsTimerPaused(false);
    //     } catch (error) {
    //         console.error('Timer reset failed:', error);
    //     }
    // };


    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', minHeight: '100vh'}}>
            {/* Grup Sıralama Bölümü */}
            <div className="group-ranking-section" style={{ flex: 1, marginRight: '20px' }}>
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

            {/* Zamanlayıcı Bölümü */}
            <div
                style={{
                    width: timer.minutes === 0 && timer.seconds <= 59 && timer.seconds > 0 ? '100vw' : '300px', // 0 dk 59 saniye kaldığında tam ekran yap
                    height: timer.minutes === 0 && timer.seconds <= 59 && timer.seconds > 0 ? '100vh' : '500px', // 0 dk 59 saniye kaldığında tam ekran yap
                    textAlign: 'center',
                    transition: 'all 0.5s ease', // Geçiş efekti ekleyerek animasyonlu geçiş sağlıyoruz
                }}
            >
                <h1 style={{ fontSize: '70px' }}>Timer</h1>
                <h1
                    style={{
                        fontSize: timer.minutes === 0 && timer.seconds <= 59 && timer.seconds > 0 ? '150px' : '100px', // 0 dk 59 saniye kaldığında font boyutunu büyüt
                        color: timer.minutes < 5 ? 'red' : 'black', // 5 dakikadan azsa kırmızı, değilse siyah
                        transition: 'color 0.5s ease', // Renk değişimi için animasyon ekleyelim
                    }}
                >
                    {timer.minutes}:{timer.seconds < 10 ? '0' + timer.seconds : timer.seconds}
                </h1>
            </div>



        </div>
    );
}

export default GroupRanking;
