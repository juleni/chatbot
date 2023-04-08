import React from "react";
import "./Chatbot.css";

export default function Chatbot({ generatedResponse }) {
  return (
    <div className="chatbot-container-in">
      <div className="chatbot-header">
        <span>CHATBOT'S RESPONSE</span>
      </div>
      <div className="chatbot-result-container">
        <div className="chatbot-text">{generatedResponse}</div>
      </div>
    </div>
  );
}
