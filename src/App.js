import { useEffect, useRef, useState } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import Chatbot from "./components/Chatbot";
import Dialog from "./components/Dialog";
import Header from "./components/Header";
import microPhoneIcon from "./microphone.svg";
import questionIcon from "./question.svg";
import settingsIcon from "./settings.svg";
import speakerIcon from "./speaker.svg";

function App() {
  const commands = [
    {
      command: "open *",
      callback: (website) => {
        window.open("http://" + website.split(" ").join(""));
      },
    },
    {
      command: "change background color to *",
      callback: (color) => {
        document.body.style.background = color;
      },
    },
    {
      command: "reset",
      callback: () => {
        handleReset();
      },
    },
    {
      command: "save",
      callback: () => {
        handleSave();
      },
    },
    {
      command: "reset background color",
      callback: () => {
        document.body.style.background = `rgba(167, 220, 246, 0.8)`;
      },
    },
  ];
  const DEFAULT_RESPONSE = "asking chatbot ... ";

  const [generatedResponse, setGeneratedResponse] = useState("");
  let messages = [];

  const onEnd = () => {
    stopHandleSpeak();
  };

  const { transcript, resetTranscript } = useSpeechRecognition({ commands });
  const { speak, cancel, speaking, supported, voices } = useSpeechSynthesis({
    onEnd,
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isQuestion, setIsQuestion] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showSpeechSettings, setShowSpeechSettings] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState(null);
  const microphoneRef = useRef(null);
  const microphoneStatusRef = useRef(null);
  const microphoneResetButtonRef = useRef(null);
  const questionRef = useRef(null);
  const questionStatusRef = useRef(null);

  const speakerRef = useRef(null);
  const speakerStatusRef = useRef(null);

  const languagesArray = ["sk-SK", "en-US"];

  const voice = voices[voiceIndex] || null;

  useEffect(() => {
    if (transcript && transcript.length > 0) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [transcript]);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <div className="mircophone-container">
        Browser is not Support Speech Recognition.
      </div>
    );
  }

  const handleListening = () => {
    stopHandleSpeak();
    if (isListening) {
      stopHandle();
    } else {
      setIsListening(true);
      microphoneRef.current.classList.add("listening");
      microphoneStatusRef.current.classList.add("listening");
      SpeechRecognition.startListening({
        continuous: true,
        language: "sk-SK",
      });
    }
  };
  const handleSpeaking = () => {
    stopHandle();
    if (isSpeaking) {
      stopHandleSpeak();
    } else {
      setIsSpeaking(true);
      speakerRef.current.classList.add("listening");
      speakerStatusRef.current.classList.add("listening");
      speak({ text: generatedResponse });
    }
  };

  function generate() {
    setGeneratedResponse(DEFAULT_RESPONSE);
    const newMessage = { role: "user", content: `${transcript}` };
    messages.push(newMessage);

    fetch("https://julenifunctionapp.azurewebsites.net/api/gptfunction?", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    })
      .then((res) => res.json())
      .then((data) => {
        const newAssistantMessage = {
          role: "assistant",
          content: `${data.completion.content}`,
        };
        messages.push(newAssistantMessage);
        setGeneratedResponse(newAssistantMessage.content);
        setIsQuestion(false);
        questionRef.current.classList.remove("listening");
        questionStatusRef.current.classList.remove("listening");
        speakerRef.current.classList.remove("disabled");
        speakerStatusRef.current.classList.remove("disabled");
        microphoneRef.current.classList.remove("disabled");
        microphoneStatusRef.current.classList.remove("disabled");
      });
  }

  const handleQuestion = () => {
    if (transcript !== null && transcript.length > 0) {
      stopHandle();
      if (isQuestion) {
        // already asking chatbot
      } else {
        setIsQuestion(true);
        questionRef.current.classList.add("listening");
        questionStatusRef.current.classList.add("listening");
        speakerRef.current.classList.add("disabled");
        speakerStatusRef.current.classList.add("disabled");
        microphoneRef.current.classList.add("disabled");
        microphoneStatusRef.current.classList.add("disabled");

        generate();
      }
    }
  };
  const stopHandle = () => {
    setIsSpeaking(false);
    setIsListening(false);
    microphoneRef.current.classList.remove("listening");
    microphoneStatusRef.current.classList.remove("listening");
    SpeechRecognition.stopListening();
  };
  const stopHandleSpeak = () => {
    setIsSpeaking(false);
    setIsListening(false);
    speakerRef.current.classList.remove("listening");
    speakerStatusRef.current.classList.remove("listening");
    cancel();
  };
  const handleReset = () => {
    //stopHandle();
    resetTranscript();
    setIsButtonDisabled(true);
  };
  const handleSave = () => {
    exporTranscript(transcript);
  };

  function exporTranscript(input) {
    const fileData = JSON.stringify(input);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "export-transcript.txt";
    link.href = url;
    link.click();
  }

  return (
    <div className="main-container">
      {/** Header */}
      <Header />
      {/** Microphone & Speaker */}
      <div className="microphone-wrapper">
        {supported && <div className="speechMenu"></div>}
        <div className="microphone-container">
          {/** Microphone */}
          <div
            className="icon-container microphone-icon-container"
            ref={microphoneRef}
            onClick={handleListening}
          >
            <img src={microPhoneIcon} className="microphone-icon" />
            <div className="microphone-status" ref={microphoneStatusRef}>
              {isListening ? "STOP Listening" : "START Listening"}
            </div>
          </div>
          {/** Ask Question */}
          <div
            className="icon-container question-icon-container"
            ref={questionRef}
            onClick={handleQuestion}
          >
            <img src={questionIcon} className="question-icon" />
            <div className="question-status" ref={questionStatusRef}>
              {isQuestion ? "ASKING chatbot" : "ASK chatbot"}
            </div>
          </div>
          {/** Speaker */}
          <div
            className="icon-container speaker-icon-container"
            ref={speakerRef}
            onClick={handleSpeaking}
          >
            <img src={speakerIcon} className="microphone-icon" />
            <div className="speaker-status" ref={speakerStatusRef}>
              {isSpeaking ? "STOP Speaking" : "START Speaking"}
            </div>
          </div>
        </div>
        {/** Transcript */}
        <div className="microphone-result-container-in">
          <div className="microphone-transcript">
            <span>
              TRANSCRIPT{" "}
              <img
                src={settingsIcon}
                className="settings-icon"
                onClick={() => setShowSpeechSettings(true)}
              />
            </span>
          </div>
          <div className="microphone-result-container">
            <div className="microphone-result-text">{transcript}</div>
            <div>
              <button
                className={
                  isButtonDisabled
                    ? "microphone-reset.disabled btn"
                    : "microphone-reset btn"
                }
                onClick={handleReset}
                ref={microphoneResetButtonRef}
                disabled={isButtonDisabled}
              >
                RESET
              </button>
              <button
                className={
                  isButtonDisabled
                    ? "microphone-save.disabled btn"
                    : "microphone-save btn"
                }
                onClick={handleSave}
                disabled={isButtonDisabled}
              >
                SAVE TO FILE
              </button>
            </div>
          </div>
        </div>
        {/** Footer */}
        <Chatbot generatedResponse={generatedResponse} />
      </div>

      <Dialog
        open={showSpeechSettings}
        onClose={() => setShowSpeechSettings(false)}
      >
        <div className="speechSettings">
          {/* VOices -- browser dependent */}
          <select
            name="voice"
            value={voiceIndex || ""}
            onChange={(e) => {
              setVoiceIndex(e.target.value);
            }}
          >
            {voices
              .filter((option) => languagesArray.includes(option.lang))
              .map((option, index) => (
                <option key={option.voiceURI} value={index}>
                  {`${option.lang} - ${option.name.slice(0, 40)} ${
                    option.default ? "- Default" : ""
                  }`}
                </option>
              ))}
          </select>
        </div>
      </Dialog>
    </div>
  );
}
export default App;
