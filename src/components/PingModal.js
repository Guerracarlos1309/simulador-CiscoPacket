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

const PingModal = ({
  sourceDevice,
  availableDevices,
  onPing,
  onClose,
  edges,
}) => {
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [targetIp, setTargetIp] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef(null);
  const bottomRef = useRef(null);

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

  // Scroll automático mejorado
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleOutput, autoScroll]);

  const addToConsole = (text, type = "normal") => {
    setConsoleOutput((prev) => [
      ...prev,
      { text, type, timestamp: new Date() },
    ]);
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      setAutoScroll(true);
    }
  };

  const scrollToTop = () => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0;
      setAutoScroll(false);
    }
  };

  const handleScroll = () => {
    if (consoleRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = consoleRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;

      // Si el usuario hace scroll manual hacia arriba, desactivar auto-scroll
      if (!isAtBottom && autoScroll) {
        setAutoScroll(false);
      }
    }
  };

  // Función para verificar si dos IPs están en la misma subred
  const areInSameSubnet = (ip1, subnet1, ip2, subnet2) => {
    if (!ip1 || !subnet1 || !ip2 || !subnet2) return false;

    const ipToNumber = (ip) => {
      return (
        ip
          .split(".")
          .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet), 0) >>> 0
      );
    };

    const subnetToNumber = (subnet) => {
      return (
        subnet
          .split(".")
          .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet), 0) >>> 0
      );
    };

    const ip1Num = ipToNumber(ip1);
    const ip2Num = ipToNumber(ip2);
    const subnet1Num = subnetToNumber(subnet1);
    const subnet2Num = subnetToNumber(subnet2);

    // Verificar si las máscaras son iguales
    if (subnet1Num !== subnet2Num) return false;

    // Calcular la red de cada IP
    const network1 = (ip1Num & subnet1Num) >>> 0;
    const network2 = (ip2Num & subnet2Num) >>> 0;

    return network1 === network2;
  };

  // Función para verificar conectividad de red
  const checkNetworkConnectivity = (
    sourceDevice,
    targetDevice,
    allDevices,
    edges
  ) => {
    const sourceIp = sourceDevice?.data.ip;
    const sourceSubnet = sourceDevice?.data.subnet;
    const targetIp = targetDevice?.data.ip;
    const targetSubnet = targetDevice?.data.subnet;

    if (!sourceIp || !targetIp) {
      return { connected: false, reason: "IP not configured" };
    }

    // Verificar si están en la misma subred
    if (areInSameSubnet(sourceIp, sourceSubnet, targetIp, targetSubnet)) {
      // Misma subred - verificar conexión física (switches actúan como puentes transparentes)
      const isPhysicallyConnected = checkPhysicalConnectivity(
        sourceDevice,
        targetDevice,
        allDevices,
        edges
      );
      if (isPhysicallyConnected) {
        return { connected: true, reason: "Same subnet, layer 2 connectivity" };
      } else {
        return { connected: false, reason: "Same subnet but no physical path" };
      }
    } else {
      // Diferentes subredes - necesitan routing
      const routingPath = checkRoutingPath(
        sourceDevice,
        targetDevice,
        allDevices,
        edges
      );
      if (routingPath.connected) {
        return { connected: true, reason: routingPath.reason };
      } else {
        return { connected: false, reason: routingPath.reason };
      }
    }
  };

  // Verificar conectividad física a través de switches (los switches no necesitan IP)
  const checkPhysicalConnectivity = (
    sourceDevice,
    targetDevice,
    allDevices,
    edges
  ) => {
    // BFS para encontrar un camino físico
    const visited = new Set();
    const queue = [sourceDevice.id];
    visited.add(sourceDevice.id);

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (currentId === targetDevice.id) {
        return true;
      }

      // Encontrar todas las conexiones del dispositivo actual
      const connections = edges.filter(
        (edge) => edge.source === currentId || edge.target === currentId
      );

      for (const connection of connections) {
        const nextId =
          connection.source === currentId
            ? connection.target
            : connection.source;

        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push(nextId);
        }
      }
    }

    return false;
  };

  // Verificar ruta a través de routers
  const checkRoutingPath = (sourceDevice, targetDevice, allDevices, edges) => {
    const sourceGateway = sourceDevice?.data.gateway;
    const targetGateway = targetDevice?.data.gateway;

    if (!sourceGateway) {
      return {
        connected: false,
        reason: "Source device has no default gateway configured",
      };
    }

    if (!targetGateway) {
      return {
        connected: false,
        reason: "Target device has no default gateway configured",
      };
    }

    // Buscar routers que tengan la IP del gateway (no necesariamente tienen que existir como dispositivos)
    const sourceRouter = allDevices.find(
      (device) => device.data.ip === sourceGateway && device.type === "router"
    );
    const targetRouter = allDevices.find(
      (device) => device.data.ip === targetGateway && device.type === "router"
    );

    // Si no existe el router físicamente, asumir que existe en la red
    if (!sourceRouter && !targetRouter) {
      // Ambos gateways no existen físicamente
      if (sourceGateway === targetGateway) {
        return { connected: true, reason: "Same gateway (assumed to exist)" };
      } else {
        return {
          connected: false,
          reason: "Different gateways, routing path unknown",
        };
      }
    }

    if (!sourceRouter) {
      return {
        connected: false,
        reason: `Source gateway ${sourceGateway} not found`,
      };
    }

    if (!targetRouter) {
      // El router de destino no existe, pero si el source router puede alcanzar la red
      const sourceToRouter = checkPhysicalConnectivity(
        sourceDevice,
        sourceRouter,
        allDevices,
        edges
      );
      if (sourceToRouter) {
        return {
          connected: true,
          reason: `Routed through ${sourceGateway} (target gateway assumed)`,
        };
      } else {
        return {
          connected: false,
          reason: "No physical path to source gateway",
        };
      }
    }

    // Verificar conectividad física del source al router
    const sourceToRouter = checkPhysicalConnectivity(
      sourceDevice,
      sourceRouter,
      allDevices,
      edges
    );
    if (!sourceToRouter) {
      return { connected: false, reason: "No physical path to source gateway" };
    }

    // Verificar conectividad física del target al router
    const targetToRouter = checkPhysicalConnectivity(
      targetDevice,
      targetRouter,
      allDevices,
      edges
    );
    if (!targetToRouter) {
      return { connected: false, reason: "No physical path to target gateway" };
    }

    // Si es el mismo router o hay conectividad entre routers
    if (sourceRouter.id === targetRouter.id) {
      return { connected: true, reason: "Routed through same gateway" };
    } else {
      // Verificar si los routers están conectados
      const routerConnectivity = checkPhysicalConnectivity(
        sourceRouter,
        targetRouter,
        allDevices,
        edges
      );
      if (routerConnectivity) {
        return { connected: true, reason: "Routed through connected gateways" };
      } else {
        return { connected: false, reason: "Gateways are not connected" };
      }
    }
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

    // Buscar dispositivo de destino (solo dispositivos con IP, switches no cuentan)
    const targetDevice = availableDevices.find(
      (device) => device.data.ip === targetIp
    );
    const allDevices = [sourceDevice, ...availableDevices];

    if (!sourceDevice?.data.ip) {
      addToConsole("Source device IP not configured.", "error");
      setIsExecuting(false);
      return;
    }

    addToConsole(``, "normal");
    addToConsole(`Pinging ${targetIp} with 32 bytes of data:`, "info");
    addToConsole(``, "normal");

    if (!targetDevice) {
      // No se encontró dispositivo con esa IP
      addToConsole(
        `Network Analysis: Target IP ${targetIp} not found in network`,
        "info"
      );
      addToConsole(``, "normal");

      for (let i = 0; i < packets; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addToConsole(`Request timed out.`, "error");
      }
    } else {
      // Verificar conectividad de red
      const connectivity = checkNetworkConnectivity(
        sourceDevice,
        targetDevice,
        allDevices,
        edges
      );

      addToConsole(`Network Analysis: ${connectivity.reason}`, "info");
      addToConsole(``, "normal");

      let successCount = 0;
      let totalTime = 0;

      for (let i = 0; i < packets; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 800 + Math.random() * 400)
        );

        if (connectivity.connected) {
          // Simular latencia basada en el tipo de conexión
          let baseLatency = 1;
          if (
            connectivity.reason.includes("router") ||
            connectivity.reason.includes("gateway")
          ) {
            baseLatency = 10; // Mayor latencia para rutas
          }

          const responseTime = baseLatency + Math.floor(Math.random() * 30);
          addToConsole(
            `Reply from ${targetIp}: bytes=32 time=${responseTime}ms TTL=128`,
            "success"
          );
          successCount++;
          totalTime += responseTime;
        } else {
          if (
            connectivity.reason.includes("gateway") ||
            connectivity.reason.includes("routing")
          ) {
            addToConsole(`Destination host unreachable.`, "error");
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
          `    Minimum = ${Math.max(1, avgTime - 5)}ms, Maximum = ${
            avgTime + 10
          }ms, Average = ${avgTime}ms`,
          "info"
        );
      }
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
      addToConsole(`  route             - Display routing information`, "info");
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
    } else if (command.toLowerCase() === "route") {
      addToConsole(``, "normal");
      addToConsole(`Active Routes:`, "info");
      addToConsole(
        `Network Destination        Netmask          Gateway       Interface`,
        "info"
      );
      addToConsole(
        `          0.0.0.0          0.0.0.0    ${
          sourceDevice?.data.gateway || "N/A"
        }    ${sourceDevice?.data.ip || "N/A"}`,
        "info"
      );
      if (sourceDevice?.data.ip && sourceDevice?.data.subnet) {
        const network = calculateNetworkAddress(
          sourceDevice.data.ip,
          sourceDevice.data.subnet
        );
        addToConsole(
          `        ${network}    ${sourceDevice.data.subnet}    ${sourceDevice.data.ip}    ${sourceDevice.data.ip}`,
          "info"
        );
      }
      addToConsole(``, "normal");
      addToConsole(`PC>${sourceDevice?.data.label || "PC"}>`, "prompt");
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

  // Función auxiliar para calcular dirección de red
  const calculateNetworkAddress = (ip, subnet) => {
    const ipParts = ip.split(".").map(Number);
    const subnetParts = subnet.split(".").map(Number);

    const networkParts = ipParts.map(
      (part, index) => part & subnetParts[index]
    );
    return networkParts.join(".");
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
                title="Ir al inicio"
              >
                <ChevronUp size={16} />
              </button>
              <button
                className="scroll-btn"
                onClick={scrollToBottom}
                title="Ir al final"
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
            {/* Elemento invisible para hacer scroll al final */}
            <div ref={bottomRef} style={{ height: "1px" }} />
          </div>

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
              {availableDevices
                .filter((device) => device.data.ip) // Solo mostrar dispositivos con IP
                .map((device) => {
                  const connectivity = checkNetworkConnectivity(
                    sourceDevice,
                    device,
                    [sourceDevice, ...availableDevices],
                    edges
                  );
                  return (
                    <div
                      key={device.id}
                      className={`device-card ${
                        connectivity.connected ? "reachable" : "unreachable"
                      }`}
                      onClick={() => setTargetIp(device.data.ip || "")}
                      title={connectivity.reason}
                    >
                      <span className="device-name">{device.data.label}</span>
                      <span className="device-ip">{device.data.ip}</span>
                      <span className="connectivity-status">
                        {connectivity.connected
                          ? "✓ Reachable"
                          : "✗ Unreachable"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="console-actions">
            <div className="console-stats">
              <span className="line-count">{consoleOutput.length} lines</span>
            </div>
            <div className="action-buttons">
              <button className="scroll-bottom-btn" onClick={scrollToBottom}>
                <ChevronDown size={16} />
                Scroll to Bottom
              </button>
              <button className="clear-console-btn" onClick={clearConsole}>
                <Trash2 size={16} />
                Clear Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingModal;
