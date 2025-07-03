"use client";

import { useState, useCallback, useRef } from "react";
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

const initialNodes = [];
const initialEdges = [];

function NetworkSimulator() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [toast, setToast] = useState(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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

      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newId = `${type}-${Date.now()}`;

      const newNode = {
        id: newId,
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
    if (!selectedDevice) {
      showToast("Error: ningún dispositivo seleccionado", "error");
      return;
    }

    const currentDevice = selectedDevice;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === currentDevice.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...config,
                // Reasignamos las funciones para no perderlas
                onConfigure: () => handleConfigure(node.id),
                onPing: () => handlePingRequest(node.id),
              },
            }
          : node
      )
    );

    setShowConfigModal(false);
    setSelectedDevice(null);
    showToast("Configuración guardada exitosamente", "success");
  };

  const handlePing = (targetIp) => {
    const sourceNode = selectedDevice;
    const targetNode = nodes.find((node) => node.data.ip === targetIp);

    if (!targetNode) {
      showToast("Dispositivo de destino no encontrado", "error");
      return;
    }

    if (!sourceNode.data.ip || !targetNode.data.ip) {
      showToast("Ambos dispositivos deben tener IP configurada", "error");
      return;
    }

    // Simular ping
    const isConnected = edges.some(
      (edge) =>
        (edge.source === sourceNode.id && edge.target === targetNode.id) ||
        (edge.target === sourceNode.id && edge.source === targetNode.id)
    );

    if (isConnected) {
      showToast(
        `Ping exitoso: ${sourceNode.data.ip} → ${targetNode.data.ip}`,
        "success"
      );
    } else {
      showToast("Ping falló: Dispositivos no conectados", "error");
    }

    setShowPingModal(false);
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

  const handleConfigure = (nodeId) => {
    console.log("handleConfigure llamado con id:", nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    console.log("Nodo encontrado:", node);
    if (node) {
      setSelectedDevice(node);
      setShowConfigModal(true);
    } else {
      console.log("Nodo no encontrado para configurar");
    }
  };

  const handlePingRequest = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedDevice(node);
      setShowPingModal(true);
    }
  };

  const nodeTypes = {
    router: (props) => (
      <RouterNode
        {...props}
        onConfigure={() => handleConfigure(props.id)}
        onPing={() => handlePingRequest(props.id)}
      />
    ),
    switch: (props) => (
      <SwitchNode
        {...props}
        onConfigure={() => handleConfigure(props.id)}
        onPing={() => handlePingRequest(props.id)}
      />
    ),
    laptop: (props) => (
      <LaptopNode
        {...props}
        onConfigure={() => handleConfigure(props.id)}
        onPing={() => handlePingRequest(props.id)}
      />
    ),
  };

  return (
    <div className="network-simulator">
      <Sidebar onClear={clearNetwork} />
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

      {showConfigModal && (
        <ConfigModal
          device={selectedDevice}
          onSave={handleConfigSave}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedDevice(null);
          }}
        />
      )}

      {showPingModal && (
        <PingModal
          sourceDevice={selectedDevice}
          availableDevices={nodes.filter((n) => n.id !== selectedDevice?.id)}
          onPing={handlePing}
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
