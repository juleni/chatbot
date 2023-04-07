import "./Dialog.css";

const Dialog = ({ open, onClose, children }) => {
  if (open) {
    return (
      <div className="dialogContainer">
        <div className="dialog">
          <span className="dialog__label">SPEECH SETTINGS</span>
          {children}
          <span className="dialog__close" onClick={onClose}>
            DONE
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default Dialog;
