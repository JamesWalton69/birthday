// File Management System
const assetFiles = {
    data: 'assets/data.txt',
    letter: 'assets/letter.txt',
    music: 'assets/music.mp3',
    images: [
        'assets/pic1.jpg',
        'assets/pic2.jpg', 
        'assets/pic3.jpg',
        'assets/pic4.jpg',
        'assets/pic5.jpg',
        'assets/pic6.jpg',
        'assets/pic7.jpg',
        'assets/pic8.jpg',
        'assets/pic9.jpg',
        'assets/pic10.jpg'
    ]
};

// Data storage
let personData = {};
let letterContent = '';
let filesLoaded = false;
let loadingErrors = [];

// Fallback data in case files can't be loaded
const fallbackPersonData = {
    name: 'Sarah Johnson',
    DOB: '1995-03-15',
    gender: 'female',
    relationship: 'best friend'
};

const fallbackLetterContent = `Dear Sarah,

Happy Birthday to the most amazing person I know! 🎉

Another year around the sun, and you continue to shine brighter with each passing day. Your kindness, laughter, and the joy you bring to everyone around you make this world a better place.

I'm so grateful to have you as my best friend. All the memories we've shared, the adventures we've been on, and the countless moments of happiness - they all feel like precious gifts.

On your special day, I wish you all the love, success, and happiness your heart can hold. May this new year of your life be filled with exciting opportunities, beautiful moments, and dreams coming true.

Thank you for being such an incredible friend and for making life so much more colorful and fun!

Happy Birthday! 🎂🎈

With love and best wishes,
Your Best Friend`;

// Global variables
let currentSection = 0;
let musicPlaying = false;
let typingIndex = 0;
let typingTimer;
const sections = ['welcome-section', 'candle-section', 'main-photo-section', 'collage-section', 'letter-section'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showLoadingState();
    loadAllAssets().then(() => {
        hideLoadingState();
        loadPersonData();
        setupEventListeners();
        showSection(0);
        console.log('All assets loaded successfully');
    }).catch((error) => {
        console.error('Error loading assets:', error);
        hideLoadingState();
        useFallbackData();
        loadPersonData();
        setupEventListeners();
        showSection(0);
    });
});

// File Loading Functions
async function loadAllAssets() {
    const loadPromises = [
        loadPersonDataFile(),
        loadLetterFile(),
        preloadImages(),
        checkAudioFile()
    ];
    
    try {
        await Promise.allSettled(loadPromises);
        filesLoaded = true;
        return Promise.resolve();
    } catch (error) {
        console.error('Failed to load some assets:', error);
        return Promise.reject(error);
    }
}

// Load person data from data.txt
async function loadPersonDataFile() {
    try {
        const response = await fetch(assetFiles.data);
        if (!response.ok) {
            throw new Error(`Failed to load ${assetFiles.data}: ${response.status}`);
        }
        
        const text = await response.text();
        personData = parseDataFile(text);
        console.log('Person data loaded:', personData);
    } catch (error) {
        console.error('Error loading person data:', error);
        loadingErrors.push(`Data file: ${error.message}`);
        personData = { ...fallbackPersonData };
    }
}

// Parse data.txt format
function parseDataFile(text) {
    const data = {};
    const lines = text.split('\n');
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && trimmedLine.includes('=')) {
            const [key, value] = trimmedLine.split('=').map(s => s.trim());
            switch(key.toLowerCase()) {
                case 'name':
                    data.name = value;
                    break;
                case 'dob':
                    data.DOB = value;
                    break;
                case 'gender':
                    data.gender = value;
                    break;
                case 'what belongs to me':
                    data.relationship = value;
                    break;
                default:
                    data[key] = value;
            }
        }
    });
    
    return data;
}

// Load letter content from letter.txt
async function loadLetterFile() {
    try {
        const response = await fetch(assetFiles.letter);
        if (!response.ok) {
            throw new Error(`Failed to load ${assetFiles.letter}: ${response.status}`);
        }
        
        letterContent = await response.text();
        console.log('Letter content loaded');
    } catch (error) {
        console.error('Error loading letter:', error);
        loadingErrors.push(`Letter file: ${error.message}`);
        letterContent = fallbackLetterContent;
    }
}

// Check if audio file exists
async function checkAudioFile() {
    try {
        const response = await fetch(assetFiles.music, { method: 'HEAD' });
        if (!response.ok) {
            throw new Error(`Audio file not found: ${response.status}`);
        }
        console.log('Audio file available');
    } catch (error) {
        console.error('Audio file check failed:', error);
        loadingErrors.push(`Audio file: ${error.message}`);
        // Disable audio functionality if file doesn't exist
        const musicControl = document.getElementById('music-control');
        if (musicControl) {
            musicControl.style.display = 'none';
        }
    }
}

// Use fallback data when files can't be loaded
function useFallbackData() {
    personData = { ...fallbackPersonData };
    letterContent = fallbackLetterContent;
    console.log('Using fallback data due to file loading errors');
}

// Show loading state
function showLoadingState() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <h2>Loading Your Birthday Celebration...</h2>
            <div class="loading-spinner"></div>
            <p>Preparing all the special memories and messages!</p>
        </div>
    `;
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(220, 38, 38, 0.9);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        text-align: center;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .loading-content h2 {
            color: white;
            margin-bottom: 20px;
        }
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loadingOverlay);
}

// Hide loading state
function hideLoadingState() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Load and display person data
function loadPersonData() {
    const nameElement = document.getElementById('person-name');
    const ageElement = document.getElementById('person-age');
    const relationshipElement = document.getElementById('person-relationship');
    const birthdayMessageElement = document.getElementById('birthday-message');
    
    // Ensure personData is loaded
    if (!personData.name) {
        console.warn('Person data not loaded, using fallback');
        personData = { ...fallbackPersonData };
    }
    
    // Calculate age
    const age = calculateAge(personData.DOB);
    
    // Update UI with error handling
    if (nameElement) nameElement.textContent = personData.name || 'Friend';
    if (ageElement) ageElement.textContent = age || '??';
    if (relationshipElement) relationshipElement.textContent = personData.relationship || 'friend';
    
    if (birthdayMessageElement) {
        const ageText = age ? `${age}th` : 'Happy';
        birthdayMessageElement.textContent = `Happy ${ageText} Birthday, ${personData.name || 'Friend'}! 🎊`;
    }
    
    // Update image sources after data is loaded
    setTimeout(updateImageSources, 100);
    
    // Report file loading status
    reportFileStatus();
}

// Calculate age from date of birth
function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Setup event listeners
function setupEventListeners() {
    // Start celebration button
    const startBtn = document.getElementById('start-celebration');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            showSection(1);
        });
    }
    
    // Candle interaction
    const flame = document.getElementById('flame');
    const candle = document.querySelector('.candle');
    
    if (flame && candle) {
        // Click to blow out candle
        flame.addEventListener('click', blowCandle);
        candle.addEventListener('click', blowCandle);
        
        // Mouse movement to blow out candle
        candle.addEventListener('mousemove', function(e) {
            const rect = candle.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // If mouse is near the flame area
            if (x > 20 && x < 40 && y < 60) {
                blowCandle();
            }
        });
        
        // Touch event for mobile
        candle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            blowCandle();
        });
    }
    
    // Music control
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }
}

// Show specific section
function showSection(index) {
    // Hide all sections
    sections.forEach((sectionId, i) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('active');
        }
    });
    
    // Show target section
    if (index < sections.length) {
        const targetSection = document.getElementById(sections[index]);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = index;
            
            // Special actions for specific sections
            if (index === 3) { // Collage section
                startMusic();
                setTimeout(() => {
                    showSection(4); // Move to letter section after 15 seconds
                }, 15000);
            } else if (index === 4) { // Letter section
                setTimeout(() => {
                    startTypingAnimation();
                }, 1000);
            }
        }
    }
}

// Blow out the candle
function blowCandle() {
    const flame = document.getElementById('flame');
    if (flame && !flame.classList.contains('blown')) {
        flame.classList.add('blown');
        
        // Wait for animation to complete, then show main photo
        setTimeout(() => {
            showSection(2);
            
            // Auto advance to collage after 5 seconds
            setTimeout(() => {
                showSection(3);
            }, 5000);
        }, 1000);
    }
}

// Start background music
function startMusic() {
    const music = document.getElementById('background-music');
    const musicControl = document.getElementById('music-control');
    const musicToggle = document.getElementById('music-toggle');
    
    if (music && musicControl) {
        musicControl.classList.remove('hidden');
        
        // Try to play music (may be blocked by browser)
        music.play().then(() => {
            musicPlaying = true;
            musicToggle.classList.remove('paused');
        }).catch((error) => {
            console.log('Auto-play was prevented:', error);
            musicToggle.classList.add('paused');
        });
    }
}

// Toggle music playback
function toggleMusic() {
    const music = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    
    if (music) {
        if (musicPlaying) {
            music.pause();
            musicPlaying = false;
            musicToggle.classList.add('paused');
            musicToggle.textContent = '🔇';
        } else {
            music.play().then(() => {
                musicPlaying = true;
                musicToggle.classList.remove('paused');
                musicToggle.textContent = '🎵';
            }).catch((error) => {
                console.log('Could not play music:', error);
            });
        }
    }
}

// Start typing animation for the letter
function startTypingAnimation() {
    const letterElement = document.getElementById('typed-letter');
    const cursor = document.getElementById('typing-cursor');
    
    if (letterElement && cursor) {
        letterElement.textContent = '';
        typingIndex = 0;
        
        function typeNextCharacter() {
            if (typingIndex < letterContent.length) {
                letterElement.textContent += letterContent[typingIndex];
                typingIndex++;
                
                // Variable typing speed for more realistic effect
                let delay = 20;
                if (letterContent[typingIndex - 1] === '.') {
                    delay = 300; // Longer pause after periods
                } else if (letterContent[typingIndex - 1] === ',') {
                    delay = 150; // Medium pause after commas
                } else if (letterContent[typingIndex - 1] === ' ') {
                    delay = 20; // Shorter delay for spaces
                } else if (letterContent[typingIndex - 1] === '\n') {
                    delay = 200; // Pause for line breaks
                }
                
                typingTimer = setTimeout(typeNextCharacter, delay);
            } else {
                // Typing complete, hide cursor after a moment
                setTimeout(() => {
                    cursor.style.display = 'none';
                }, 2000);
            }
        }
        
        typeNextCharacter();
    }
}

// Add some sparkle effects to the page
function addSparkleEffects() {
    const sparkleElements = document.querySelectorAll('.sparkles');
    
    sparkleElements.forEach(element => {
        setInterval(() => {
            const sparkle = document.createElement('span');
            sparkle.textContent = '✨';
            sparkle.style.position = 'absolute';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.fontSize = (Math.random() * 10 + 10) + 'px';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.animation = 'sparkleFloat 2s ease-out forwards';
            
            element.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 2000);
        }, 3000);
    });
}

// Initialize sparkle effects after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSparkleEffects, 2000);
});

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight' || event.key === ' ') {
        if (currentSection < sections.length - 1) {
            showSection(currentSection + 1);
        }
    } else if (event.key === 'ArrowLeft') {
        if (currentSection > 0) {
            showSection(currentSection - 1);
        }
    }
});

// Add touch/swipe navigation for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - go to next section
            if (currentSection < sections.length - 1) {
                showSection(currentSection + 1);
            }
        } else {
            // Swipe right - go to previous section
            if (currentSection > 0) {
                showSection(currentSection - 1);
            }
        }
    }
}

// Enhanced image preloading with error handling
function preloadImages() {
    return new Promise((resolve, reject) => {
        const imagePromises = assetFiles.images.map(imageSrc => {
            return new Promise((imgResolve, imgReject) => {
                const img = new Image();
                
                img.onload = () => {
                    console.log(`Image loaded: ${imageSrc}`);
                    imgResolve(imageSrc);
                };
                
                img.onerror = () => {
                    console.error(`Failed to load image: ${imageSrc}`);
                    loadingErrors.push(`Image: ${imageSrc}`);
                    // Don't reject, just resolve with error info
                    imgResolve(null);
                };
                
                img.src = imageSrc;
            });
        });
        
        Promise.allSettled(imagePromises).then(results => {
            const loadedImages = results.filter(result => result.value !== null).length;
            console.log(`${loadedImages}/${assetFiles.images.length} images loaded successfully`);
            resolve();
        });
    });
}

// Update image sources with error handling
function updateImageSources() {
    // Update main photo
    const mainPhoto = document.getElementById('main-photo');
    if (mainPhoto) {
        const img = new Image();
        img.onload = () => {
            mainPhoto.src = assetFiles.images[0];
        };
        img.onerror = () => {
            console.log('Using placeholder for main photo');
            // Keep the existing SVG placeholder
        };
        img.src = assetFiles.images[0];
    }
    
    // Update carousel images
    const photoItems = document.querySelectorAll('.photo-item img');
    photoItems.forEach((imgElement, index) => {
        if (index + 1 < assetFiles.images.length) {
            const img = new Image();
            img.onload = () => {
                imgElement.src = assetFiles.images[index + 1];
            };
            img.onerror = () => {
                console.log(`Using placeholder for photo ${index + 2}`);
                // Keep the existing SVG placeholder
            };
            img.src = assetFiles.images[index + 1];
        }
    });
}

// File status reporting
function reportFileStatus() {
    if (loadingErrors.length > 0) {
        console.warn('Some files could not be loaded:');
        loadingErrors.forEach(error => console.warn('- ' + error));
    }
    
    // Show status to user if needed
    if (loadingErrors.length > 0) {
        const statusMessage = document.createElement('div');
        statusMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(255, 193, 7, 0.9);
                color: #000;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
                max-width: 300px;
            ">
                ⚠️ Some assets couldn't be loaded. Using fallback content.
                <button onclick="this.parentElement.remove()" style="
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    float: right;
                ">×</button>
            </div>
        `;
        document.body.appendChild(statusMessage);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (statusMessage.parentNode) {
                statusMessage.remove();
            }
        }, 5000);
    }
}

// Add confetti effect for special moments
function createConfetti() {
    const colors = ['#dc2626', '#991b1b', '#fca5a5', '#fed7d7', '#fbb6ce'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}

// Add confetti animation CSS
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Trigger confetti on candle blow
const originalBlowCandle = blowCandle;
blowCandle = function() {
    originalBlowCandle();
    createConfetti();
};
