"use client";

import { useState } from "react";
import {
  Router,
  Wifi,
  Laptop,
  Network,
  Zap,
  Settings,
  Play,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Terminal,
  Globe,
  Shield,
} from "lucide-react";

const HomePage = ({ onStartSimulator }) => {
  const [activeTab, setActiveTab] = useState("features");

  const features = [
    {
      icon: <Network size={24} />,
      title: "Dispositivos de Red",
      description: "Routers, switches y laptops con configuración realista",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Terminal size={24} />,
      title: "Consola Realista",
      description:
        "Interfaz de línea de comandos similar a Cisco Packet Tracer",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <Zap size={24} />,
      title: "Simulación de Ping",
      description: "Pruebas de conectividad con análisis de red en tiempo real",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      icon: <Globe size={24} />,
      title: "Routing Inteligente",
      description: "Verificación automática de subredes y rutas de red",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <Settings size={24} />,
      title: "Configuración IP",
      description: "Asignación de direcciones IP, máscaras y gateways",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: <Shield size={24} />,
      title: "Análisis de Conectividad",
      description: "Diagnóstico automático de problemas de red",
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Arrastra Dispositivos",
      description:
        "Selecciona routers, switches o laptops del panel lateral y arrástralos al canvas",
      icon: <Router size={20} />,
    },
    {
      number: "02",
      title: "Conecta Dispositivos",
      description:
        "Haz clic y arrastra entre los puertos de los dispositivos para crear conexiones",
      icon: <Network size={20} />,
    },
    {
      number: "03",
      title: "Configura IPs",
      description:
        "Haz clic en 'Configurar' en cada dispositivo para asignar direcciones IP y configuración de red",
      icon: <Settings size={20} />,
    },
    {
      number: "04",
      title: "Prueba Conectividad",
      description:
        "Usa el botón 'Ping' para abrir la consola y probar la comunicación entre dispositivos",
      icon: <Zap size={20} />,
    },
  ];

  const commands = [
    {
      command: "ping 192.168.1.1",
      description: "Envía paquetes ICMP a una dirección IP específica",
    },
    {
      command: "ipconfig",
      description: "Muestra la configuración IP del dispositivo actual",
    },
    {
      command: "route",
      description: "Visualiza la tabla de rutas del dispositivo",
    },
    { command: "help", description: "Lista todos los comandos disponibles" },
    { command: "clear", description: "Limpia la salida de la consola" },
  ];

  const examples = [
    {
      title: "Red Simple",
      description: "Dos laptops conectadas a través de un switch",
      topology: "Laptop1 ↔ Switch ↔ Laptop2",
      config: "Misma subred (192.168.1.0/24)",
    },
    {
      title: "Red con Router",
      description: "Dos subredes conectadas por un router",
      topology: "Laptop1 ↔ Router ↔ Laptop2",
      config: "Diferentes subredes con gateway",
    },
    {
      title: "Red Compleja",
      description: "Múltiples dispositivos y subredes",
      topology: "Switch ↔ Router ↔ Switch con múltiples hosts",
      config: "VLAN y routing entre subredes",
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Simulador de Red
              <span className="hero-subtitle">
                Aprende redes de forma práctica
              </span>
            </h1>
            <p className="hero-description">
              Una herramienta didáctica, diseñada para simular, configurar 
              y evaluar redes de computadoras de manera interactiva.
            </p>
            <div className="hero-actions">
              <button className="start-btn" onClick={onStartSimulator}>
                <Play size={20} />
                Comenzar Simulación
              </button>
              <button
                className="learn-btn"
                onClick={() => setActiveTab("tutorial")}
              >
                <BookOpen size={20} />
                Ver Tutorial
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="network-diagram">
              <div className="device laptop-demo">
                <Laptop size={24} />
                <span>Laptop</span>
              </div>
              <div className="connection-line"></div>
              <div className="device switch-demo">
                <Wifi size={24} />
                <span>Switch</span>
              </div>
              <div className="connection-line"></div>
              <div className="device router-demo">
                <Router size={24} />
                <span>Router</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="content-section">
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "features" ? "active" : ""}`}
            onClick={() => setActiveTab("features")}
          >
            Características
          </button>
          <button
            className={`tab-btn ${activeTab === "tutorial" ? "active" : ""}`}
            onClick={() => setActiveTab("tutorial")}
          >
            Tutorial
          </button>
          <button
            className={`tab-btn ${activeTab === "commands" ? "active" : ""}`}
            onClick={() => setActiveTab("commands")}
          >
            Comandos
          </button>
          <button
            className={`tab-btn ${activeTab === "examples" ? "active" : ""}`}
            onClick={() => setActiveTab("examples")}
          >
            Ejemplos
          </button>
        </div>

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="tab-content">
            <h2 className="section-title">Características Principales</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className={`feature-icon ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorial Tab */}
        {activeTab === "tutorial" && (
          <div className="tab-content">
            <h2 className="section-title">Cómo Usar el Simulador</h2>
            <div className="tutorial-steps">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{step.number}</div>
                  <div className="step-content">
                    <div className="step-header">
                      <div className="step-icon">{step.icon}</div>
                      <h3 className="step-title">{step.title}</h3>
                    </div>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="tutorial-cta">
              <button className="start-btn" onClick={onStartSimulator}>
                <Play size={20} />
                ¡Empezar Ahora!
              </button>
            </div>
          </div>
        )}

        {/* Commands Tab */}
        {activeTab === "commands" && (
          <div className="tab-content">
            <h2 className="section-title">Comandos de Consola</h2>
            <p className="commands-intro">
              La consola del simulador soporta varios comandos para diagnosticar
              y probar la conectividad de red:
            </p>
            <div className="commands-list">
              {commands.map((cmd, index) => (
                <div key={index} className="command-card">
                  <div className="command-syntax">
                    <Terminal size={16} />
                    <code>{cmd.command}</code>
                  </div>
                  <p className="command-description">{cmd.description}</p>
                </div>
              ))}
            </div>
            <div className="commands-note">
              <div className="note-icon">
                <CheckCircle size={20} />
              </div>
              <div className="note-content">
                <strong>Tip:</strong> Usa el comando <code>help</code> dentro de
                la consola para ver todos los comandos disponibles.
              </div>
            </div>
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === "examples" && (
          <div className="tab-content">
            <h2 className="section-title">Ejemplos de Topologías</h2>
            <div className="examples-grid">
              {examples.map((example, index) => (
                <div key={index} className="example-card">
                  <h3 className="example-title">{example.title}</h3>
                  <p className="example-description">{example.description}</p>
                  <div className="example-topology">
                    <strong>Topología:</strong> {example.topology}
                  </div>
                  <div className="example-config">
                    <strong>Configuración:</strong> {example.config}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="footer-cta">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para comenzar?</h2>
          <p className="cta-description">
            Crea tu primera red y experimenta con diferentes configuraciones
          </p>
          <button className="start-btn large" onClick={onStartSimulator}>
            <Play className="flecha" size={24} />
              Abrir Simulador..
            <ArrowRight className="flecha" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
