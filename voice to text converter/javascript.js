class VoiceToTextConverter {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.finalTranscript = '';
        
        this.micBtn = document.getElementById('micBtn');
        this.status = document.getElementById('status');
        this.output = document.getElementById('output');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.languageSelect = document.getElementById('languageSelect');
        this.errorMsg = document.getElementById('errorMsg');
        
        this.init();
    }
    
    init() {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            this.micBtn.disabled = true;
            return;
        }
        
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.languageSelect.value;
        
        this.setupEventListeners();
        this.setupRecognitionEvents();
    }
    
    setupEventListeners() {
        this.micBtn.addEventListener('click', () => this.toggleListening());
        this.clearBtn.addEventListener('click', () => this.clearText());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn.addEventListener('click', () => this.downloadText());
        this.languageSelect.addEventListener('change', () => this.changeLanguage());
    }
    
    setupRecognitionEvents() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI();
            this.showStatus('Listening... Speak now!');
            this.clearError();
        };
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            this.output.value = this.finalTranscript + interimTranscript;
            this.output.scrollTop = this.output.scrollHeight;
        };
        
        this.recognition.onerror = (event) => {
            let errorMessage = 'Speech recognition error: ';
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Audio capture failed. Please check your microphone.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage += 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            this.showError(errorMessage);
            this.stopListening();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
            this.showStatus('Click the microphone to start recording');
        };
    }
    
    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        try {
            this.recognition.start();
        } catch (error) {
            this.showError('Failed to start speech recognition. Please try again.');
        }
    }
    
    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    updateUI() {
        if (this.isListening) {
            this.micBtn.classList.add('listening');
            this.micBtn.innerHTML = '🔴';
            this.status.classList.add('listening');
        } else {
            this.micBtn.classList.remove('listening');
            this.micBtn.innerHTML = '🎤';
            this.status.classList.remove('listening');
        }
    }
    
    showStatus(message) {
        this.status.textContent = message;
    }
    
    showError(message) {
        this.errorMsg.textContent = message;
        setTimeout(() => {
            this.errorMsg.textContent = '';
        }, 5000);
    }
    
    clearError() {
        this.errorMsg.textContent = '';
    }
    
    clearText() {
        this.output.value = '';
        this.finalTranscript = '';
        this.showStatus('Text cleared. Click the microphone to start recording');
    }
    
    copyToClipboard() {
        if (!this.output.value) {
            this.showError('No text to copy');
            return;
        }
        
        this.output.select();
        document.execCommand('copy');
        this.showStatus('Text copied to clipboard!');
        
        // Reset status after 2 seconds
        setTimeout(() => {
            this.showStatus('Click the microphone to start recording');
        }, 2000);
    }
    
    downloadText() {
        if (!this.output.value) {
            this.showError('No text to download');
            return;
        }
        
        const blob = new Blob([this.output.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voice-to-text-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatus('Text file downloaded!');
        setTimeout(() => {
            this.showStatus('Click the microphone to start recording');
        }, 2000);
    }
    
    changeLanguage() {
        if (this.recognition) {
            this.recognition.lang = this.languageSelect.value;
            if (this.isListening) {
                this.stopListening();
                setTimeout(() => this.startListening(), 100);
            }
        }
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceToTextConverter();
});

