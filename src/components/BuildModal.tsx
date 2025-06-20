import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./BuildModal.css";
import { useResourcesStore } from "../store/resourcesStore";
import useBuildStore from "../store/buildStore";
import useStructureStore from "../store/structureStore";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "1000px",
    backgroundColor: "#fefefe",
    padding: "1rem",
    borderRadius: "8px",
    maxHeight: "90vh",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },
  overlay: { zIndex: 1000 },
};

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuildModal: React.FC<BuildModalProps> = ({ isOpen, onClose }) => {
  const strucutresStore = useStructureStore();
  const buildStore = useBuildStore();
  const structures = useStructureStore((state) =>
    state.getStructures(buildStore.x, buildStore.y, buildStore.entityId)
  );
  const resourcesState = useResourcesStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      strucutresStore.loadStructures(
        buildStore.x,
        buildStore.y,
        buildStore.entityId
      );
    }
  }, [isOpen, buildStore]);

  const handleBuild = (structure_type: string) => {
    fetch(
      `http://localhost:8000/v1/entity/${buildStore.entityId}/structures/${structure_type}?x=${buildStore.x}&y=${buildStore.y}`,
      {
        method: "POST",
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((res) => {
            throw new Error("Failed to build: " + res.detail);
          });
        }
        strucutresStore.loadStructures(
          buildStore.x,
          buildStore.y,
          buildStore.entityId
        );
        strucutresStore.reloadEntityStructures(buildStore.entityId);
        resourcesState.updateResources();
        return response.json();
      })
      .catch((error) => setError(error.message));
  };

  const handleUpgrade = (structure_id: string) => {
    fetch(
      `http://localhost:8000/v1/entity/${buildStore.entityId}/structures/${structure_id}?x=${buildStore.x}&y=${buildStore.y}`,
      {
        method: "PUT",
        credentials: "include",
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((res) => {
            throw new Error("Failed to upgrade: " + res.detail);
          });
        }

        strucutresStore.loadStructures(
          buildStore.x,
          buildStore.y,
          buildStore.entityId
        );
        strucutresStore.reloadEntityStructures(buildStore.entityId);
        resourcesState.updateResources();
        return response.json();
      })
      .catch((error) => setError(error.message));
  };

  const handleDestroy = (structure_id: string) => {
    fetch(`http://localhost:8000/v1/structures/${structure_id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to destroy");
        }
        strucutresStore.loadStructures(
          buildStore.x,
          buildStore.y,
          buildStore.entityId
        );
        resourcesState.updateResources();
        return response.json();
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Build Modal"
      ariaHideApp={false}
    >
      <button onClick={onClose} className="close-button">
        &times;
      </button>
      <h2 className="modal-title">
        Build Structures on ({buildStore.x}, {buildStore.y})
      </h2>
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {structures && (
        <div className="modal-content">
          <div className="structures-section">
            <h3>Built Structures</h3>
            {structures.built_structures.length > 0 ? (
              <div className="structure-list">
                {structures.built_structures.map((structure) => (
                  <div className="structure-card" key={structure.structure_id}>
                    <h4>{structure.title}</h4>
                    <p>{structure.description}</p>
                    {structure.production_components.length > 0 && [
                      <p className="components-title">Production:</p>,
                      <ul className="components-list">
                        {structure.production_components.map(
                          (component, index) =>
                            "resource_production" === component.type ? (
                              <li key={index}>
                                {component.title}: {component.value} ( Uses{" "}
                                {component.slot_usage} slots)
                              </li>
                            ) : (
                              <li key={index}>{component.title}</li>
                            )
                        )}
                      </ul>,
                    ]}
                    {structure.requirement_components.length > 0 && [
                      <p className="components-title">Upgrade Requirements:</p>,
                      <ul className="components-list">
                        {structure.requirement_components.map(
                          (component, index) =>
                            "resource_requirement" === component.type ? (
                              <li key={index}>
                                {component.title}: {component.value}
                              </li>
                            ) : (
                              <li key={index}>{component.title}</li>
                            )
                        )}
                      </ul>,
                    ]}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "right",
                        width: "100%",
                        gap: "1rem",
                        position: "absolute",
                        bottom: "1rem",
                        right: "1.5rem",
                      }}
                    >
                      <button
                        onClick={() => handleUpgrade(structure.structure_id)}
                        className="upgrade-button"
                      >
                        Upgrade
                      </button>
                      <button
                        onClick={() => handleDestroy(structure.structure_id)}
                        className="destroy-button"
                      >
                        Destroy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No structures built yet.</p>
            )}
          </div>

          <div className="structures-section">
            <h3>Buildable Structures</h3>
            {structures.structure_templates.length > 0 ? (
              <div className="structure-list">
                {structures.structure_templates.map((structure_template) => (
                  <div
                    className="structure-card"
                    key={structure_template.structure_type}
                  >
                    <h4>{structure_template.title}</h4>
                    <span>{structure_template.description}</span>
                    {structure_template.production_components.length > 0 && [
                      <p className="components-title">Production:</p>,
                      <ul className="components-list">
                        {structure_template.production_components.map(
                          (component, index) =>
                            "resource_production" === component.type ? (
                              <li key={index}>
                                {component.title}: {component.value} ( Uses{" "}
                                {component.slot_usage} slots)
                              </li>
                            ) : (
                              <li key={index}>{component.title}</li>
                            )
                        )}
                      </ul>,
                    ]}
                    {structure_template.requirement_components.length > 0 && [
                      <p className="components-title">Build Requirements:</p>,
                      <ul className="components-list">
                        {structure_template.requirement_components.map(
                          (component, index) =>
                            "resource_requirement" === component.type ? (
                              <li key={index}>
                                {component.title}: {component.value}
                              </li>
                            ) : (
                              <li key={index}>{component.title}</li>
                            )
                        )}
                      </ul>,
                    ]}
                    <button
                      className="build-button"
                      onClick={() =>
                        handleBuild(structure_template.structure_type)
                      }
                    >
                      Build
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No buildable structures.</p>
            )}
          </div>

          <div className="structures-section">
            <h3>Debug: Unbuildable structures</h3>
            <ul>
              {structures &&
                structures.other_templates &&
                Object.entries(structures.other_templates).map(([k, v]) => (
                  <li
                    style={{
                      listStyle: "initial",
                      marginLeft: "30px",
                    }}
                  >
                    {k}: {v}
                    <br />
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BuildModal;
