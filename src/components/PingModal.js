"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Terminal,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PingModal = ({ sourceDevice, availableDevices, onPing, onClose }) => {
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [targetIp, setTargetIp] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const consoleRef = useRef(null);

  useEffect(() => {
    // Mensaje de bienvenida
    const welcomeMessage = [
      `Cisco Packet Tracer PC Command Line 1.0`,
      `Copyright 2007-2024 Cisco Systems, Inc.`,
      ``,
      `PC>${sourceDevice?.data.label || "PC"}>`,
      ``,
    ];
    setConsoleOutput(
      welcomeMessage.map((text) => ({
        text,
        type: "normal",
        timestamp: new Date(),
      }))
    );
  }, [sourceDevice]);

  useEffect(() => {
    // Auto scroll al final solo si autoScroll está activado
    if (consoleRef.current && autoScroll) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput, autoScroll]);

  // Detectar si el usuario está en la parte inferior
  const handleScroll = () => {
    if (consoleRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isBottom);

      // Si el usuario hace scroll manual, desactivar auto-scroll temporalmente
      if (!isBottom) {
        setAutoScroll(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      setAutoScroll(true);
      setIsAtBottom(true);
    }
  };

  const scrollToTop = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0;
      setAutoScroll(false);
      setIsAtBottom(false);
    }
  };

  const addToConsole = (text, type = "normal") => {
    setConsoleOutput((prev) => [
      ...prev,
      { text, type, timestamp: new Date() },
    ]);

    // Reactivar auto-scroll cuando se agrega nuevo contenido
    setTimeout(() => {
      if (isAtBottom) {
        setAutoScroll(true);
      }
    }, 100);
  };

  const simulatePing = async (targetIp, packets = 4) => {
    setIsExecuting(true);
    setAutoScroll(true); // Activar auto-scroll durante la ejecución

    // Validar IP
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(targetIp)) {
      addToConsole(
        `Ping request could not find host ${targetIp}. Please check the name and try again.`,
        "error"
      );
      setIsExecuting(false);
      return;
    }

    // Buscar dispositivo de destino
    const targetDevice = availableDevices.find(
      (device) => device.data.ip === targetIp
    );
    const sourceIp = sourceDevice?.data.ip;

    if (!sourceIp) {
      addToConsole("Source device IP not configured.", "error");
      setIsExecuting(false);
      return;
    }

    addToConsole(``, "normal");
    addToConsole(`Pinging ${targetIp} with 32 bytes of data:`, "info");
    addToConsole(``, "normal");

    let successCount = 0;
    let totalTime = 0;

    for (let i = 0; i < packets; i++) {
      // Simular delay de red
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 400)
      );

      if (!targetDevice) {
        addToConsole(`Request timed out.`, "error");
      } else if (!targetDevice.data.ip) {
        addToConsole(`Destination host unreachable.`, "error");
      } else {
        // Simular éxito/fallo basado en conectividad
        const isConnected = Math.random() > 0.1; // 90% de éxito para dispositivos configurados
        const responseTime = Math.floor(Math.random() * 50) + 1;

        if (isConnected) {
          addToConsole(
            `Reply from ${targetIp}: bytes=32 time=${responseTime}ms TTL=128`,
            "success"
          );
          successCount++;
          totalTime += responseTime;
        } else {
          addToConsole(`Request timed out.`, "error");
        }
      }
    }

    // Estadísticas finales
    addToConsole(``, "normal");
    addToConsole(`Ping statistics for ${targetIp}:`, "info");
    addToConsole(
      `    Packets: Sent = ${packets}, Received = ${successCount}, Lost = ${
        packets - successCount
      } (${Math.round(((packets - successCount) / packets) * 100)}% loss),`,
      "info"
    );

    if (successCount > 0) {
      const avgTime = Math.round(totalTime / successCount);
      addToConsole(`Approximate round trip times in milli-seconds:`, "info");
      addToConsole(
        `    Minimum = ${Math.max(1, avgTime - 10)}ms, Maximum = ${
          avgTime + 15
        }ms, Average = ${avgTime}ms`,
        "info"
      );
    }

    addToConsole(``, "normal");
    addToConsole(`PC>${sourceDevice?.data.label || "PC"}>`, "prompt");
    setIsExecuting(false);
  };

  const executeCommand = async () => {
    if (!currentCommand.trim() || isExecuting) return;

    const command = currentCommand.trim();
    addToConsole(
      `PC>${sourceDevice?.data.label || "PC"}>${command}`,
      "command"
    );

    // Parsear comando ping
    const pingMatch = command.match(/^ping\s+(.+)$/i);
    if (pingMatch) {
      const target = pingMatch[1].trim();
      await simulatePing(target);
    } else if (command.toLowerCase() === "help") {
      addToConsole(`Available commands:`, "info");
      addToConsole(
        `  ping <ip_address>  - Send ICMP echo requests to network host`,
        "info"
      );
      addToConsole(`  help              - Display this help message`, "info");
      addToConsole(`  clear             - Clear console output`, "info");
      addToConsole(`  ipconfig          - Display IP configuration`, "info");
      addToConsole(``, "normal");
      addToConsole(`PC>${sourceDevice?.data.label || "PC"}>`, "prompt");
    } else if (command.toLowerCase() === "clear") {
      setConsoleOutput([
        {
          text: `PC>${sourceDevice?.data.label || "PC"}>`,
          type: "prompt",
          timestamp: new Date(),
        },
      ]);
      setAutoScroll(true);
    } else if (command.toLowerCase() === "ipconfig") {
      addToConsole(``, "normal");
      addToConsole(`Windows IP Configuration`, "info");
      addToConsole(``, "normal");
      addToConsole(`Ethernet adapter Local Area Connection:`, "info");
      addToConsole(``, "normal");
      addToConsole(`   Connection-specific DNS Suffix  . :`, "info");
      addToConsole(
        `   IP Address. . . . . . . . . . . : ${
          sourceDevice?.data.ip || "0.0.0.0"
        }`,
        "info"
      );
      addToConsole(
        `   Subnet Mask . . . . . . . . . . : ${
          sourceDevice?.data.subnet || "0.0.0.0"
        }`,
        "info"
      );
      addToConsole(
        `   Default Gateway . . . . . . . . : ${
          sourceDevice?.data.gateway || ""
        }`,
        "info"
      );
      addToConsole(``, "normal");
      addToConsole(`PC>${sourceDevice?.data.label || "PC"}>`, "prompt");
    } else {
      addToConsole(
        `'${command}' is not recognized as an internal or external command,`,
        "error"
      );
      addToConsole(`operable program or batch file.`, "error");
      addToConsole(``, "normal");
      addToConsole(`PC>${sourceDevice?.data.label || "PC"}>`, "prompt");
    }

    setCurrentCommand("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      executeCommand();
    }
  };

  const quickPing = async () => {
    if (!targetIp.trim()) return;
    setCurrentCommand(`ping ${targetIp.trim()}`);
    addToConsole(
      `PC>${sourceDevice?.data.label || "PC"}>ping ${targetIp.trim()}`,
      "command"
    );
    await simulatePing(targetIp.trim());
    setTargetIp("");
  };

  const clearConsole = () => {
    setConsoleOutput([
      {
        text: `PC>${sourceDevice?.data.label || "PC"}>`,
        type: "prompt",
        timestamp: new Date(),
      },
    ]);
    setAutoScroll(true);
  };

  return (
    <div className="modal-overlay">
      <div className="console-modal">
        <div className="modal-header">
          <div className="header-left">
            <Terminal size={20} />
            <h3>Command Prompt - {sourceDevice?.data.label}</h3>
          </div>
          <div className="header-controls">
            <div className="scroll-controls">
              <button
                className="scroll-btn"
                onClick={scrollToTop}
                title="Scroll to top"
              >
                <ChevronUp size={16} />
              </button>
              <button
                className="scroll-btn"
                onClick={scrollToBottom}
                title="Scroll to bottom"
              >
                <ChevronDown size={16} />
              </button>
              <div className="auto-scroll-indicator">
                <input
                  type="checkbox"
                  id="autoScroll"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                />
                <label htmlFor="autoScroll">Auto-scroll</label>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="console-container">
          <div
            className="console-output"
            ref={consoleRef}
            onScroll={handleScroll}
          >
            {consoleOutput.map((line, index) => (
              <div key={index} className={`console-line ${line.type}`}>
                {line.text}
              </div>
            ))}
            {isExecuting && (
              <div className="console-line executing">
                <span className="loading-dots">Executing command</span>
              </div>
            )}
          </div>

          {!isAtBottom && (
            <div className="scroll-indicator">
              <button className="scroll-to-bottom-btn" onClick={scrollToBottom}>
                <ChevronDown size={16} />
                Scroll to bottom to see latest output
              </button>
            </div>
          )}

          <div className="console-input-container">
            <span className="console-prompt">
              PC&gt;{sourceDevice?.data.label || "PC"}&gt;
            </span>
            <input
              type="text"
              className="console-input"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isExecuting}
              placeholder="Type command here... (try 'help' or 'ping 192.168.1.1')"
              autoFocus
            />
          </div>
        </div>

        <div className="console-controls">
          <div className="quick-ping-section">
            <h4>Quick Ping:</h4>
            <div className="quick-ping-controls">
              <input
                type="text"
                value={targetIp}
                onChange={(e) => setTargetIp(e.target.value)}
                placeholder="Enter IP address"
                className="quick-ping-input"
                disabled={isExecuting}
              />
              <button
                className="quick-ping-btn"
                onClick={quickPing}
                disabled={isExecuting || !targetIp.trim()}
              >
                <Play size={16} />
                Ping
              </button>
            </div>
          </div>

          <div className="available-devices-section">
            <h4>Available Devices:</h4>
            <div className="device-grid">
              {availableDevices.map((device) => (
                <div
                  key={device.id}
                  className="device-card"
                  onClick={() => setTargetIp(device.data.ip || "")}
                >
                  <span className="device-name">{device.data.label}</span>
                  <span className="device-ip">{device.data.ip || "No IP"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="console-actions">
            <div className="console-stats">
              <span className="line-count">{consoleOutput.length} lines</span>
            </div>
            <button className="clear-console-btn" onClick={clearConsole}>
              <Trash2 size={16} />
              Clear Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingModal;
