// src/components/BuildModal.tsx

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useResourcesStore } from "../store/resourcesStore";
import useBuildStore from "../store/buildStore";
import useStructureStore from "../store/structureStore";
import Resources from "./Resources";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuildModal: React.FC<BuildModalProps> = ({ isOpen, onClose }) => {
  /* --------------------------------------------------------------------
   * Stores & State
   * ------------------------------------------------------------------*/
  const structureStore = useStructureStore();
  const buildStore = useBuildStore();
  const resourcesState = useResourcesStore();

  const structures = useStructureStore((state) =>
    state.getStructures(buildStore.x, buildStore.y, buildStore.entityId)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------------------------
   * Effects
   * ------------------------------------------------------------------*/
  useEffect(() => {
    if (isOpen) {
      structureStore.loadStructures(
        buildStore.x,
        buildStore.y,
        buildStore.entityId
      );
    }
  }, [isOpen, buildStore]);

  /* --------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------*/
  const handleRequest = (url: string, method: "POST" | "PUT" | "DELETE") => {
    setLoading(true);
    fetch(url, { method, credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.detail ?? "Request failed");
        }
        return res.json();
      })
      .then(() => {
        structureStore.loadStructures(
          buildStore.x,
          buildStore.y,
          buildStore.entityId
        );
        structureStore.reloadEntityStructures(buildStore.entityId);
        resourcesState.updateResources();
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleBuild = (structureType: string) =>
    handleRequest(
      `http://localhost:8000/v1/entity/${buildStore.entityId}/structures/${structureType}?x=${buildStore.x}&y=${buildStore.y}`,
      "POST"
    );

  const handleUpgrade = (structureId: string) =>
    handleRequest(
      `http://localhost:8000/v1/entity/${buildStore.entityId}/structures/${structureId}?x=${buildStore.x}&y=${buildStore.y}`,
      "PUT"
    );

  const handleDestroy = (structureId: string) =>
    handleRequest(
      `http://localhost:8000/v1/structures/${structureId}`,
      "DELETE"
    );

  /* --------------------------------------------------------------------
   * Render helpers
   * ------------------------------------------------------------------*/
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200">
      {children}
    </div>
  );

  const ProductionList = ({
    production,
  }: {
    production: (typeof structures.structure_templates)[number]["production_components"];
  }) =>
    production.length > 0 ? (
      <div className="space-y-1 mb-3">
        <p className="font-semibold text-gray-700">Production:</p>
        <ul className="list-disc ml-5 text-sm space-y-1">
          {production.map((c, idx) => (
            <li key={idx}>
              {c.title}
              {c.type === "resource_production" && (
                <>
                  : {c.value} (uses {c.slot_usage} slots)
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const RequirementList = ({
    requirements,
    title,
  }: {
    requirements: (typeof structures.structure_templates)[number]["requirement_components"];
    title: string;
  }) =>
    requirements.length > 0 ? (
      <div className="space-y-1 mb-3">
        <p className="font-semibold text-gray-700">{title}:</p>
        <ul className="list-disc ml-5 text-sm space-y-1">
          {requirements.map((c, idx) => (
            <li key={idx}>
              {c.title}
              {c.type === "resource_requirement" && <>: {c.value}</>}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  /* --------------------------------------------------------------------
   * JSX
   * ------------------------------------------------------------------*/
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Build Modal"
      ariaHideApp={true}
      shouldCloseOnOverlayClick={false}
      className="relative w-11/12 max-w-6xl bg-white p-6 rounded-lg max-h-[90vh] shadow-lg overflow-y-auto outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-black"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Resources summary */}
      <Resources />

      {/* Title */}
      <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">
        Build Structures on ({buildStore.x}, {buildStore.y})
      </h2>

      {/* Loading / Error */}
      {loading && (
        <p className="text-center font-bold text-orange-600 mb-4">Loading...</p>
      )}
      {error && (
        <p className="text-center font-bold text-red-600 mb-4">{error}</p>
      )}

      {/* Sections */}
      {structures && (
        <div className="flex flex-col gap-12">
          {/* Built Structures */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-600 border-b pb-1 border-blue-600">
              Built Structures
            </h3>

            {structures.built_structures.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {structures.built_structures.map((structure) => (
                  <Card key={structure.structure_id}>
                    {/* Title */}
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {structure.title}
                    </h4>
                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-3">
                      {structure.description}
                    </p>

                    {/* Production */}
                    <ProductionList
                      production={structure.production_components}
                    />

                    {/* Requirements */}
                    <RequirementList
                      requirements={structure.requirement_components}
                      title="Upgrade Requirements"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto self-end">
                      <button
                        onClick={() => handleUpgrade(structure.structure_id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Upgrade
                      </button>
                      <button
                        onClick={() => handleDestroy(structure.structure_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        Destroy
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No structures built yet.</p>
            )}
          </section>

          {/* Buildable Structures */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-blue-600 border-b pb-1 border-blue-600">
              Buildable Structures
            </h3>

            {structures.structure_templates.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {structures.structure_templates.map((template) => (
                  <Card key={template.structure_type}>
                    {/* Title */}
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {template.title}
                    </h4>
                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-3">
                      {template.description}
                    </p>

                    {/* Production */}
                    <ProductionList
                      production={template.production_components}
                    />

                    {/* Requirements */}
                    <RequirementList
                      requirements={template.requirement_components}
                      title="Build Requirements"
                    />

                    {/* Build Button */}
                    <button
                      onClick={() => handleBuild(template.structure_type)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm self-end mt-auto focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Build
                    </button>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No buildable structures.</p>
            )}
          </section>

          {/* Debug */}
          {Object.keys(structures.other_templates).length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600 border-b pb-1 border-blue-600">
                Debug: Unbuildable Structures
              </h3>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                {structures.other_templates &&
                  Object.entries(structures.other_templates).map(([k, v]) => (
                    <li key={k} className="text-gray-700">
                      {k}: {v}
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
};

export default BuildModal;
