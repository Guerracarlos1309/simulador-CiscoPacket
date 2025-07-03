"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";

const PingModal = ({ sourceDevice, availableDevices, onPing, onClose }) => {
  const [targetIp, setTargetIp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (targetIp) {
      onPing(targetIp);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Ping desde {sourceDevice?.data.label}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ping-form">
          <div className="source-info">
            <p>
              <strong>Origen:</strong>{" "}
              {sourceDevice?.data.ip || "IP no configurada"}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="targetIp">IP de Destino:</label>
            <input
              type="text"
              id="targetIp"
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              placeholder="192.168.1.2"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
              required
            />
          </div>

          <div className="available-devices">
            <h4>Dispositivos Disponibles:</h4>
            <div className="device-list">
              {availableDevices.map((device) => (
                <div
                  key={device.id}
                  className="device-option"
                  onClick={() => setTargetIp(device.data.ip || "")}
                >
                  <span>{device.data.label}</span>
                  <span className="device-ip">
                    {device.data.ip || "Sin IP"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="ping-btn">
              <Zap size={16} />
              Enviar Ping
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PingModal;
