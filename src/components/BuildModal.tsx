import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useResourcesStore } from "../store/resourcesStore";
import useBuildStore from "../store/buildStore";
import useStructureStore from "../store/structureStore";

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
      contentLabel="Build Modal"
      ariaHideApp={false}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-3xl bg-white p-4 rounded-lg max-h-[90vh] shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-6 bg-transparent border-0 text-3xl cursor-pointer text-gray-400 hover:text-black"
      >
        &times;
      </button>
      <h2 className="mb-5 text-center text-2xl text-gray-800">
        Build Structures on ({buildStore.x}, {buildStore.y})
      </h2>
      {loading && <p className="text-center font-bold text-red-600">Loading...</p>}
      {error && <p className="text-center font-bold text-red-600">{error}</p>}
      {structures && (
        <div className="flex flex-col gap-8">
          <div className="structures-section">
            <h3 className="text-blue-500 border-b-2 border-blue-500 pb-1">
              Built Structures
            </h3>
            {structures.built_structures.length > 0 ? (
              <div className="grid gap-5 justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {structures.built_structures.map((structure) => (
                  <div
                    className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col relative"
                    key={structure.structure_id}
                  >
                    <h4 className="text-gray-800 text-lg font-semibold">
                      {structure.title}
                    </h4>
                    <p>{structure.description}</p>
                    {structure.production_components.length > 0 && (
                      <>
                        <p className="font-bold mb-1 text-gray-600">
                          Production:
                        </p>
                        <ul className="list-disc ml-4 mb-2">
                          {structure.production_components.map(
                            (component, index) =>
                              component.type === "resource_production" ? (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}: {component.value} ( Uses{" "}
                                  {component.slot_usage} slots)
                                </li>
                              ) : (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}
                                </li>
                              )
                          )}
                        </ul>
                      </>
                    )}
                    {structure.requirement_components.length > 0 && (
                      <>
                        <p className="font-bold mb-1 text-gray-600">
                          Upgrade Requirements:
                        </p>
                        <ul className="list-disc ml-4 mb-2">
                          {structure.requirement_components.map(
                            (component, index) =>
                              component.type === "resource_requirement" ? (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}: {component.value}
                                </li>
                              ) : (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}
                                </li>
                              )
                          )}
                        </ul>
                      </>
                    )}
                    <div className="flex justify-end w-full gap-4 absolute bottom-4 right-6">
                      <button
                        onClick={() => handleUpgrade(structure.structure_id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded mt-auto"
                      >
                        Upgrade
                      </button>
                      <button
                        onClick={() => handleDestroy(structure.structure_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded mt-auto"
                      >
                        Destroy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No structures built yet.</p>
            )}
          </div>

          <div className="structures-section">
            <h3 className="text-blue-500 border-b-2 border-blue-500 pb-1">
              Buildable Structures
            </h3>
            {structures.structure_templates.length > 0 ? (
              <div className="grid gap-5 justify-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {structures.structure_templates.map((structure_template) => (
                  <div
                    className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col relative"
                    key={structure_template.structure_type}
                  >
                    <h4 className="text-gray-800 text-lg font-semibold">
                      {structure_template.title}
                    </h4>
                    <span>{structure_template.description}</span>
                    {structure_template.production_components.length > 0 && (
                      <>
                        <p className="font-bold mb-1 text-gray-600">
                          Production:
                        </p>
                        <ul className="list-disc ml-4 mb-2">
                          {structure_template.production_components.map(
                            (component, index) =>
                              component.type === "resource_production" ? (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}: {component.value} ( Uses{" "}
                                  {component.slot_usage} slots)
                                </li>
                              ) : (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}
                                </li>
                              )
                          )}
                        </ul>
                      </>
                    )}
                    {structure_template.requirement_components.length > 0 && (
                      <>
                        <p className="font-bold mb-1 text-gray-600">
                          Build Requirements:
                        </p>
                        <ul className="list-disc ml-4 mb-2">
                          {structure_template.requirement_components.map(
                            (component, index) =>
                              component.type === "resource_requirement" ? (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}: {component.value}
                                </li>
                              ) : (
                                <li className="mb-1 text-gray-700" key={index}>
                                  {component.title}
                                </li>
                              )
                          )}
                        </ul>
                      </>
                    )}
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded mt-auto self-end"
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
              <p className="text-gray-500 italic">No buildable structures.</p>
            )}
          </div>

          <div className="structures-section">
            <h3 className="text-blue-500 border-b-2 border-blue-500 pb-1">
              Debug: Unbuildable structures
            </h3>
            <ul className="list-disc ml-4">
              {structures &&
                structures.other_templates &&
                Object.entries(structures.other_templates).map(([k, v]) => (
                  <li className="mb-1 text-gray-700" key={k}>
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
