"use client";

import { Handle, Position } from "reactflow";
import { Laptop, Settings, Zap } from "lucide-react";

const LaptopNode = ({ data, id }) => {
  const handleConfigure = () => {
    console.log("Laptop - Configurar clickeado, ID:", id);
    window.dispatchEvent(
      new CustomEvent("configureNode", { detail: { nodeId: id } })
    );
  };

  const handlePing = () => {
    console.log("Laptop - Ping clickeado, ID:", id);
    window.dispatchEvent(
      new CustomEvent("pingNode", { detail: { nodeId: id } })
    );
  };

  return (
    <div className="device-node laptop-node">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      <div className="device-header">
        <Laptop size={20} />
        <span className="device-title">{data.label}</span>
      </div>

      <div className="device-info">
        <div className="info-row">
          <span>IP: {data.ip || "No configurada"}</span>
        </div>
        <div className="info-row">
          <span>Subnet: {data.subnet || "No configurada"}</span>
        </div>
      </div>

      <div className="device-actions">
        <button className="action-btn config-btn" onClick={handleConfigure}>
          <Settings size={14} />
          Configurar
        </button>
        <button className="action-btn ping-btn" onClick={handlePing}>
          <Zap size={14} />
          Ping
        </button>
      </div>
    </div>
  );
};

export default LaptopNode;
