"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";

import RouterNode from "./components/RouterNode";
import SwitchNode from "./components/SwitchNode";
import LaptopNode from "./components/LaptopNode";
import Sidebar from "./components/Sidebar";
import ConfigModal from "./components/ConfigModal";
import PingModal from "./components/PingModal";
import Toast from "./components/Toast";
import HomePage from "./components/HomePage";

const nodeTypes = {
  router: RouterNode,
  switch: SwitchNode,
  laptop: LaptopNode,
};

function NetworkSimulator() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Escuchar eventos personalizados para configurar y ping
  useEffect(() => {
    const handleConfigureEvent = (event) => {
      const { nodeId } = event.detail;
      console.log("Evento configurar recibido para nodo:", nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedDevice(node);
        setShowConfigModal(true);
      }
    };

    const handlePingEvent = (event) => {
      const { nodeId } = event.detail;
      console.log("Evento ping recibido para nodo:", nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedDevice(node);
        setShowPingModal(true);
      }
    };

    window.addEventListener("configureNode", handleConfigureEvent);
    window.addEventListener("pingNode", handlePingEvent);

    return () => {
      window.removeEventListener("configureNode", handleConfigureEvent);
      window.removeEventListener("pingNode", handlePingEvent);
    };
  }, [nodes]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: "default",
        style: { stroke: "#4ade80", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeId = `${type}-${Date.now()}`;
      const newNode = {
        id: nodeId,
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
            nodes.length + 1
          }`,
          ip: "",
          subnet: "",
          gateway: "",
          dns: "",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const handleConfigSave = (config) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedDevice.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...config,
              },
            }
          : node
      )
    );
    setShowConfigModal(false);
    setSelectedDevice(null);
    showToast("Configuración guardada exitosamente", "success");
  };

  const handlePingSubmit = (targetIp) => {
    // Esta función ya no se usa, el ping se maneja dentro del PingModal
    setShowPingModal(false);
    setSelectedDevice(null);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearNetwork = () => {
    setNodes([]);
    setEdges([]);
    showToast("Red limpiada", "success");
  };

  const startSimulator = () => {
    setShowHomePage(false);
  };

  const goToHomePage = () => {
    setShowHomePage(true);
  };

  if (showHomePage) {
    return <HomePage onStartSimulator={startSimulator} />;
  }

  return (
    <div className="network-simulator">
      <Sidebar onClear={clearNetwork} onGoHome={goToHomePage} />
      <div className="main-content" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background color="#f1f5f9" gap={20} />
        </ReactFlow>
      </div>

      {showConfigModal && selectedDevice && (
        <ConfigModal
          device={selectedDevice}
          onSave={handleConfigSave}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedDevice(null);
          }}
        />
      )}

      {showPingModal && selectedDevice && (
        <PingModal
          sourceDevice={selectedDevice}
          availableDevices={nodes.filter((n) => n.id !== selectedDevice?.id)}
          edges={edges}
          onPing={handlePingSubmit}
          onClose={() => {
            setShowPingModal(false);
            setSelectedDevice(null);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <NetworkSimulator />
    </ReactFlowProvider>
  );
}

export default App;
