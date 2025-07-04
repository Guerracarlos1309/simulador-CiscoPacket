"use client";
import { Router, Wifi, Laptop, Trash2, Home } from "lucide-react";

const Sidebar = ({ onClear, onGoHome }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Simulador de Red</h2>
        <p>Arrastra los dispositivos a la mesa de trabajo</p>
      </div>

      <div className="device-list">
        <div
          className="device-item router"
          draggable
          onDragStart={(event) => onDragStart(event, "router")}
        >
          <Router size={24} />
          <span>Router</span>
        </div>

        <div
          className="device-item switch"
          draggable
          onDragStart={(event) => onDragStart(event, "switch")}
        >
          <Wifi size={24} />
          <span>Switch</span>
        </div>

        <div
          className="device-item laptop"
          draggable
          onDragStart={(event) => onDragStart(event, "laptop")}
        >
          <Laptop size={24} />
          <span>Laptop</span>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="home-button" onClick={onGoHome}>
          <Home size={16} />
          Página Principal
        </button>

        <button className="clear-button" onClick={onClear}>
          <Trash2 size={16} />
          Limpiar Red
        </button>
      </div>

      <div className="instructions">
        <h3>Instrucciones:</h3>
        <ul>
          <li>Arrastra dispositivos a la mesa de trabajo</li>
          <li>Conecta dispositivos arrastrando desde los puertos</li>
          <li>Haz clic en "Configurar" para establecer IP</li>
          <li>Usa "Ping" para probar conectividad</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
