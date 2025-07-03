"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const ConfigModal = ({ device, onSave, onClose }) => {
  const [config, setConfig] = useState({
    ip: "",
    subnet: "",
    gateway: "",
    dns: "",
  });

  useEffect(() => {
    if (device) {
      setConfig({
        ip: device.data.ip || "",
        subnet: device.data.subnet || "",
        gateway: device.data.gateway || "",
        dns: device.data.dns || "",
      });
    }
  }, [device]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Configurar {device?.data.label}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="config-form">
          <div className="form-group">
            <label htmlFor="ip">Dirección IP:</label>
            <input
              type="text"
              id="ip"
              value={config.ip}
              onChange={(e) => handleChange("ip", e.target.value)}
              placeholder="192.168.1.1"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subnet">Máscara de Subred:</label>
            <input
              type="text"
              id="subnet"
              value={config.subnet}
              onChange={(e) => handleChange("subnet", e.target.value)}
              placeholder="255.255.255.0"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
            />
          </div>

          <div className="form-group">
            <label htmlFor="gateway">Gateway:</label>
            <input
              type="text"
              id="gateway"
              value={config.gateway}
              onChange={(e) => handleChange("gateway", e.target.value)}
              placeholder="192.168.1.1"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dns">DNS:</label>
            <input
              type="text"
              id="dns"
              value={config.dns}
              onChange={(e) => handleChange("dns", e.target.value)}
              placeholder="8.8.8.8"
              pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              <Save size={16} />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;
