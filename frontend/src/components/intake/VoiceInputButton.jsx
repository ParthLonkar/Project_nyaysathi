import React, { useMemo, useRef, useState } from 'react';

export default function VoiceInputButton({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('');
  const recognitionRef = useRef(null);

  const SpeechRecognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatusText('');
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      setStatusText('Voice input is not supported in this browser. You can type your complaint.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText('Listening... speak your complaint');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText.trim()) {
        onTranscript(finalText.trim());
      }
    };

    recognition.onerror = () => {
      setStatusText('Voice input encountered an issue. Please continue by typing.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!statusText.includes('not supported')) {
        setStatusText('Voice input stopped.');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
          isListening
            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
            : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isListening ? 'Stop Voice Input' : 'Start Voice Input'}
      </button>
      {statusText && <p className="text-sm text-gray-600 mt-2">{statusText}</p>}
    </div>
  );
}
