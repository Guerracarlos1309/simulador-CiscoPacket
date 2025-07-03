import { CheckCircle, XCircle } from "lucide-react";

const Toast = ({ message, type }) => {
  return (
    <div className={`toast toast-${type}`}>
      {type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
