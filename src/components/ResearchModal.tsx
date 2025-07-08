import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./ResearchModal.css";
import type { ResearchForestData } from "../store/researchStore";
import { useResearchStore } from "../store/researchStore";
// @ts-ignore
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
// @ts-ignore
import Dagre from "cytoscape-dagre";
// @ts-ignore
import Elk from "cytoscape-elk";
Cytoscape.use(Elk);
Cytoscape.use(Dagre);

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    padding: "1rem",
    borderRadius: "8px",
    height: "100vh",
    maxHeight: "100vh",
    backgroundColor: "#f0f0f0",
  },
  overlay: { zIndex: 1000 },
};

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function nodeToId(node: any): string {
  return `${node.node_type}-${node.type}-${node.level}`;
}
const ResearchModal: React.FC<ResearchModalProps> = ({ isOpen, onClose }) => {
  const researchStore = useResearchStore();
  const [forest, setForest] = useState<ResearchForestData | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      researchStore.loadResearchForest();
    }
  }, [isOpen]);

  useEffect(() => {
    setForest(researchStore.researchForest);
  }, [researchStore.researchForest]);

  useEffect(() => {
    if (forest) {
      const newNodes = forest.nodes.map((node) => ({
        data: {
          id: nodeToId(node),
          label: node.title,
          type: node.status,
          node_type: node.node_type,
          layer: forest.node_rank[nodeToId(node)],
        },
        grabbable: false,
      }));

      const newEdges = Object.entries(forest.edges).flatMap(
        ([target, sources]) =>
          Array.from(sources).map((source) => ({
            data: {
              source: nodeToId(forest.nodes[source]),
              target: nodeToId(forest.nodes[parseInt(target, 10)]),
              source_label: forest.nodes[source].title,
              target_label: forest.nodes[parseInt(target, 10)].title,
            },
          }))
      );
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [forest]);

  const dagreLayout = {
    name: "dagre",
    rankDir: "TB", // 'TB' for top to bottom flow, 'LR' for left to right,
    align: "DL", // 'UL' for upper left, 'UR' for upper right, 'DL' for down left, 'DR' for down right
    nodeSep: 100, // the separation between adjacent nodes in the same rank
    edgeSep: 100, // the separation between adjacent edges in the same rank
    rankSep: 200, // the separation between each rank in the layout
    ranker: "network-simplex", // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
    acyclicer: "greedy", // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
    spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    minLen: function (edge: any) {
      return 1;
    }, // number of ranks to keep between the source and target of the edge
    fit: true, // whether to fit to viewport
    animate: false, // whether to transition the node positions
    animationDuration: 1000, // duration of animation in ms if enabled
    padding: 30, // fit padding
    nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
    sort: function (a: any, b: any) {
      return a.data("layer") - b.data("layer");
    },
  };

  const elkLayout = {
    name: "elk",
    options: {
      nodeDimensionsIncludeLabels: true,
      fit: true,
      padding: 30,
      animate: true,
      animationDuration: 1000,
      animationEasing: true,
    },
    elk: {
      algorithm: "layered",
      "elk.direction": "DOWN",
      "layered.mergeEdges": "true",
      "layered.mergeHierarchyEdges": "true",
      "layered.layering.strategy": "COFFMAN_GRAHAM",
      "layered.considerModelOrder.strategy": "NODES_AND_EDGES",
      contentAlignment: "H_CENTER",
      edgeRouting: "POLYLINE",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Research Modal"
      ariaHideApp={false}
    >
      <button onClick={onClose} className="close-button">
        &times;
      </button>
      <h2 className="modal-title">Research</h2>
      <div className="modal-controls">
        {/* highlight autofilled text box autocomplete element by name (with fuzzy search) */}
      </div>
      <CytoscapeComponent
        cy={(cy: any) => {
          cy.on("click", "node", (evt: any) => {
            if (!evt.target) {
              return;
            }
            if (evt.target.id()[0] === "s") {
              return;
            }
            
            console.log("clicked " + evt.target);
          });
        }}
        layout={dagreLayout}
        elements={[...nodes, ...edges]}
        style={{ width: "100%", height: "100%" }}
        stylesheet={[
          {
            selector: 'node[type="unlocked"]',
            style: {
              backgroundColor: "#2ecc71",
              label: "data(label)",
              color: "#000",
              textWrap: "wrap",
              textMaxWidth: "80px",
              textValign: "center",
              textHalign: "center",
              width: "label",
              shape: "rectangle",
              fontSize: "18px",
              padding: "30px",
            },
          },
          {
            selector: 'node[type="unlockable"]',
            style: {
              backgroundColor: "#3498db",
              label: "data(label)",
              color: "#000",
              textWrap: "wrap",
              textMaxWidth: "80px",
              textValign: "center",
              textHalign: "center",
              width: "label",
              shape: "rectangle",
              fontSize: "18px",
              padding: "30px",
            },
          },
          {
            selector: 'node[node_type="research"]',
            style: {
              shape: "ellipse",
            },
          },
          {
            selector: 'node[node_type="structure"]',
            style: {
              shape: "rectangle",
            },
          },
          {
            selector: "edge",
            style: {
              targetArrowShape: "triangle",
              targetArrowColor: "#000",
              width: 2,
              lineColor: "#000",
              curveStyle: "bezier",
              opacity: 1,
            },
          },
        ]}
      />
    </Modal>
  );
};

export default ResearchModal;
