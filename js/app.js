// Get current user
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// Initialize localStorage if needed
const storageKey = `emotions_${currentUser.id}`;
if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, JSON.stringify([]));
}

// Function to generate random emotion data
function generateRandomEmotion() {
    const emotions = [EMOTION_TYPES.SENANG, EMOTION_TYPES.SEDIH, EMOTION_TYPES.STRES, EMOTION_TYPES.MARAH];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const randomIntensity = Math.floor(Math.random() * 5) + 1;
    
    const notes = [
        'Saat mengerjakan tugas',
        'Selama pembelajaran online',
        'Ketika diskusi kelompok',
        'Saat presentasi',
        'Waktu mengerjakan ujian',
        'Dalam sesi tanya jawab',
        'Ketika belajar mandiri'
    ];
    
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    return {
        date: new Date().toISOString(),
        type: randomEmotion,
        intensity: randomIntensity,
        notes: randomNote
    };
}

// Function to automatically save emotion data
function autoSaveEmotion() {
    const emotion = generateRandomEmotion();
    const emotions = JSON.parse(localStorage.getItem(storageKey));
    emotions.push(emotion);
    localStorage.setItem(storageKey, JSON.stringify(emotions));
    
    // Update UI
    updateDashboard();
    updateHistory();
    updateStatistics();
    
    // Show recommendation if needed
    if ((emotion.type === EMOTION_TYPES.SEDIH || 
         emotion.type === EMOTION_TYPES.STRES || 
         emotion.type === EMOTION_TYPES.MARAH) && 
        emotion.intensity >= 4) {
        showRecommendations(emotion.type);
    }
    
    // Update emotion display in input page
    const detectedEmotion = document.getElementById('detectedEmotion');
    if (detectedEmotion) {
        const emotionText = emotion.type.charAt(0).toUpperCase() + emotion.type.slice(1);
        detectedEmotion.textContent = emotionText;
        detectedEmotion.style.color = getEmotionColor(emotion.type);
        
        // Update intensity display
        const intensityInput = document.getElementById('intensity');
        const intensityValue = document.getElementById('intensityValue');
        if (intensityInput && intensityValue) {
            intensityInput.value = emotion.intensity;
            intensityValue.textContent = emotion.intensity;
        }
    }
}

// Start automatic emotion generation (every 5 seconds)
setInterval(autoSaveEmotion, 5000);

// Constants for emotion types and recommendations
const EMOTION_TYPES = {
    SENANG: 'senang',
    SEDIH: 'sedih',
    STRES: 'stres',
    MARAH: 'marah'
};

const RECOMMENDATIONS = {
    [EMOTION_TYPES.SEDIH]: [
        'Cobalah berbicara dengan teman atau keluarga tentang perasaan Anda',
        'Lakukan aktivitas yang Anda sukai untuk menghibur diri',
        'Dengarkan musik favorit Anda',
        'Ingatlah bahwa perasaan ini bersifat sementara'
    ],
    [EMOTION_TYPES.STRES]: [
        'Tarik napas dalam-dalam selama 5 menit',
        'Lakukan peregangan ringan',
        'Ambil jeda sejenak dari aktivitas belajar',
        'Minum air putih dan rileks sejenak'
    ],
    [EMOTION_TYPES.MARAH]: [
        'Hitung mundur dari 10 ke 1 sambil bernapas dalam',
        'Tulis perasaan Anda di catatan',
        'Lakukan aktivitas fisik ringan untuk menyalurkan energi',
        'Dengarkan musik yang menenangkan'
    ]
};

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = item.dataset.page;
        
        // Update active states
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        item.classList.add('active');
        document.getElementById(targetPage).classList.add('active');

        // Update content if needed
        if (targetPage === 'dashboard') updateDashboard();
        if (targetPage === 'history') updateHistory();
        if (targetPage === 'statistics') updateStatistics();
        if (targetPage === 'journal') updateJournalEntries();
    });
});

// Camera and Emotion Detection Setup
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let model = null;
let currentEmotion = null;
let currentIntensity = 3;

// Initialize camera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve(video);
            };
        });
    } catch (error) {
        console.error('Error accessing camera:', error);
        document.getElementById('detectedEmotion').textContent = 'Error: Cannot access camera';
    }
}

// Load face-landmarks-detection model
async function loadModel() {
    try {
        model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
        );
    } catch (error) {
        console.error('Error loading model:', error);
        document.getElementById('detectedEmotion').textContent = 'Error: Cannot load model';
    }
}

// Detect emotions from facial expressions
async function detectEmotion() {
    if (!model || !video.videoWidth) return;

    ctx.drawImage(video, 0, 0);
    const predictions = await model.estimateFaces({
        input: video
    });

    if (predictions.length > 0) {
        // Simplified emotion detection based on facial landmarks
        const landmarks = predictions[0].landmarks;
        
        // This is a simplified example. In a real application,
        // you would use more sophisticated emotion detection algorithms
        const emotion = analyzeEmotion(landmarks);
        updateEmotionDisplay(emotion);
    }

    requestAnimationFrame(detectEmotion);
}

// Simplified emotion analysis
function analyzeEmotion(landmarks) {
    // This is a placeholder implementation that uses facial landmarks
    // to make a simple estimation of emotion
    try {
        // Calculate basic facial metrics from landmarks
        // In a real implementation, you would use proper ML models
        const mouthOpenness = calculateMouthOpenness(landmarks);
        const eyeOpenness = calculateEyeOpenness(landmarks);
        const eyebrowPosition = calculateEyebrowPosition(landmarks);

        // Simple rule-based emotion detection
        if (mouthOpenness > 0.7 && eyeOpenness > 0.6) {
            return EMOTION_TYPES.SENANG; // Big smile, wide eyes
        } else if (eyebrowPosition < 0.3 && mouthOpenness < 0.4) {
            return EMOTION_TYPES.SEDIH; // Lowered eyebrows, closed mouth
        } else if (eyebrowPosition > 0.7 && eyeOpenness > 0.7) {
            return EMOTION_TYPES.STRES; // Raised eyebrows, wide eyes
        } else if (eyebrowPosition > 0.6 && mouthOpenness < 0.3) {
            return EMOTION_TYPES.MARAH; // Raised eyebrows, tight mouth
        }

        // Default to a random emotion if unsure
        const emotions = Object.values(EMOTION_TYPES);
        return emotions[Math.floor(Math.random() * emotions.length)];
    } catch (error) {
        console.error('Error in emotion analysis:', error);
        return EMOTION_TYPES.SENANG; // Default to happy if analysis fails
    }
}

// Helper functions for facial analysis
function calculateMouthOpenness(landmarks) {
    // Simplified calculation - in reality, you'd use proper facial landmarks
    return Math.random(); // Placeholder
}

function calculateEyeOpenness(landmarks) {
    return Math.random(); // Placeholder
}

function calculateEyebrowPosition(landmarks) {
    return Math.random(); // Placeholder
}

// Update emotion display
function updateEmotionDisplay(emotion) {
    const detectedEmotion = document.getElementById('detectedEmotion');
    if (emotion !== currentEmotion) {
        currentEmotion = emotion;
        detectedEmotion.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
        
        // Update intensity based on emotion
        currentIntensity = Math.floor(Math.random() * 5) + 1;
        intensityInput.value = currentIntensity;
        intensityValue.textContent = currentIntensity;
        
        // Automatically save the emotion
        saveEmotion();
    }
}

// Initialize camera and model
async function init() {
    await setupCamera();
    await loadModel();
    detectEmotion();
}

init();

// Emotion Form Handling
const emotionForm = document.getElementById('emotionForm');
const intensityInput = document.getElementById('intensity');
const intensityValue = document.getElementById('intensityValue');

// Function to save emotion automatically when detected
function saveEmotion() {
    if (!currentEmotion) return;

    const emotion = {
        date: new Date().toISOString(),
        type: currentEmotion,
        intensity: currentIntensity
    };

    // Save to localStorage
    const emotions = JSON.parse(localStorage.getItem(storageKey));
    emotions.push(emotion);
    localStorage.setItem(storageKey, JSON.stringify(emotions));

    // Show recommendations if needed
    if ((emotion.type === 'sedih' || emotion.type === 'stres' || emotion.type === 'marah') && emotion.intensity >= 4) {
        showRecommendations(emotion.type);
    }
    
    // Update relevant sections
    updateDashboard();
    updateHistory();
    updateStatistics();
}

// Show Recommendations
function showRecommendations(emotionType) {
    const recommendations = document.getElementById('recommendations');
    const recommendationText = getRecommendationText(emotionType);
    
    recommendations.innerHTML = recommendationText;
    recommendations.classList.remove('hidden');
    
    setTimeout(() => {
        recommendations.classList.add('hidden');
    }, 10000);
}

function getRecommendationText(emotionType) {
    const recommendations = {
        sedih: [
            "Cobalah berbicara dengan teman atau keluarga tentang perasaan Anda",
            "Lakukan aktivitas yang Anda sukai untuk menghibur diri",
            "Ingatlah bahwa perasaan ini bersifat sementara"
        ],
        stres: [
            "Tarik napas dalam-dalam selama 5 menit",
            "Lakukan peregangan ringan",
            "Ambil jeda sejenak dari aktivitas belajar"
        ],
        marah: [
            "Hitung mundur dari 10 ke 1 sambil bernapas dalam",
            "Tulis perasaan Anda di jurnal",
            "Lakukan aktivitas fisik ringan untuk menyalurkan energi"
        ]
    };

    const randomIndex = Math.floor(Math.random() * recommendations[emotionType].length);
    return `<strong>Rekomendasi:</strong> ${recommendations[emotionType][randomIndex]}`;
}

// Update Dashboard
function updateDashboard() {
    const emotions = JSON.parse(localStorage.getItem(storageKey));
    
    // Update total entries
    document.getElementById('totalEntries').textContent = emotions.length;

    // Update today's mood
    const today = new Date().toDateString();
    const todayEmotions = emotions.filter(e => new Date(e.date).toDateString() === today);
    
    if (todayEmotions.length > 0) {
        const latestEmotion = todayEmotions[todayEmotions.length - 1];
        const emotionText = latestEmotion.type.charAt(0).toUpperCase() + latestEmotion.type.slice(1);
        document.getElementById('todayMood').textContent = `${emotionText} (${latestEmotion.intensity})`;
        document.getElementById('todayMood').style.color = getEmotionColor(latestEmotion.type);
    } else {
        document.getElementById('todayMood').textContent = 'Belum ada data';
        document.getElementById('todayMood').style.color = '';
    }

    // Update daily emotion chart
    const dailyData = emotions.reduce((acc, emotion) => {
        const date = new Date(emotion.date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, count: 0 };
        }
        acc[date].count++;
        return acc;
    }, {});

    const chartData = Object.values(dailyData).slice(-7); // Last 7 days

    const ctx = document.getElementById('dailyEmotionChart');
    if (window.dailyChart) {
        window.dailyChart.destroy();
    }

    window.dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.date),
            datasets: [{
                label: 'Jumlah Emosi per Hari',
                data: chartData.map(d => d.count),
                backgroundColor: 'rgba(74, 144, 226, 0.7)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Aktivitas Emosi 7 Hari Terakhir',
                    font: { size: 16 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Get color for emotion type
function getEmotionColor(emotionType) {
    const colors = {
        [EMOTION_TYPES.SENANG]: '#2ECC71',  // Green
        [EMOTION_TYPES.SEDIH]: '#3498DB',   // Blue
        [EMOTION_TYPES.STRES]: '#F1C40F',   // Yellow
        [EMOTION_TYPES.MARAH]: '#E74C3C'    // Red
    };
    return colors[emotionType] || '#7F8C8D';
}

// Update History Table
function updateHistory() {
    const emotions = JSON.parse(localStorage.getItem(storageKey));
    const tbody = document.querySelector('#emotionHistory tbody');
    
    tbody.innerHTML = emotions.slice().reverse().map((emotion, index) => {
        const emotionText = emotion.type.charAt(0).toUpperCase() + emotion.type.slice(1);
        const date = new Date(emotion.date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
        <tr>
            <td>${date}</td>
            <td style="color: ${getEmotionColor(emotion.type)}">${emotionText}</td>
            <td>${emotion.intensity}</td>
            <td>${emotion.notes || '-'}</td>
            <td>
                <button onclick="deleteEmotion(${emotions.length - 1 - index})" class="btn-delete">Hapus</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Delete Emotion Entry
function deleteEmotion(index) {
    const emotions = JSON.parse(localStorage.getItem(storageKey));
    emotions.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(emotions));
    
    updateDashboard();
    updateHistory();
    updateStatistics();
}

// Update Statistics
function updateStatistics() {
    const emotions = JSON.parse(localStorage.getItem(storageKey));
    const ctx1 = document.getElementById('emotionDistribution');
    const ctx2 = document.getElementById('intensityTrend');

    // Clear existing charts if they exist
    if (window.emotionChart) window.emotionChart.destroy();
    if (window.intensityChart) window.intensityChart.destroy();
    
    // Emotion distribution chart
    const emotionCounts = emotions.reduce((acc, emotion) => {
        acc[emotion.type] = (acc[emotion.type] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(emotionCounts).map(type => 
        type.charAt(0).toUpperCase() + type.slice(1)
    );

    const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
    const percentages = Object.values(emotionCounts).map(count => 
        ((count / total) * 100).toFixed(1)
    );

    window.emotionChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
            datasets: [{
                data: Object.values(emotionCounts),
                backgroundColor: Object.keys(emotionCounts).map(type => getEmotionColor(type))
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribusi Emosi',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Intensity trend chart
    const intensityData = emotions.slice(-14).map(e => ({
        date: new Date(e.date).toLocaleDateString(),
        intensity: e.intensity,
        type: e.type
    }));

    window.intensityChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: intensityData.map(d => d.date),
            datasets: [{
                label: 'Intensitas Emosi',
                data: intensityData.map(d => d.intensity),
                borderColor: 'rgba(74, 144, 226, 1)',
                backgroundColor: intensityData.map(d => getEmotionColor(d.type) + '40'),
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tren Intensitas Emosi (14 Hari Terakhir)',
                    font: { size: 16 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const dataPoint = intensityData[context.dataIndex];
                            const emotionType = dataPoint.type.charAt(0).toUpperCase() + dataPoint.type.slice(1);
                            return `${emotionType}: Intensitas ${dataPoint.intensity}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Intensitas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tanggal'
                    }
                }
            }
        }
    });
}



// Initialize the dashboard on load
updateDashboard();
