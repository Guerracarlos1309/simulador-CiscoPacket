"use client";
import { Handle, Position } from "reactflow";
import { Wifi, Settings, Zap } from "lucide-react";

const SwitchNode = ({ data }) => {
  return (
    <div className="device-node switch-node">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="device-header">
        <Wifi size={20} />
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
        <button
          className="action-btn config-btn"
          onClick={() => data.onConfigure?.()}
        >
          <Settings size={14} />
          Configurar
        </button>
        <button className="action-btn ping-btn" onClick={() => data.onPing?.()}>
          <Zap size={14} />
          Ping
        </button>
      </div>
    </div>
  );
};

export default SwitchNode;
