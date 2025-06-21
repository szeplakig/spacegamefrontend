import { create } from "zustand";

export interface ResearchForestData {
  nodes: {
    node_type: string;
    title: string;
    type: string;
    level: number;
    status: string;
  }[];
  edges: {
    [source: number]: number[];
  };
  node_rank: {
    [nodeId: string]: number;
  };
}

interface ResearchState {
  researchForest: ResearchForestData | null;
  loadResearchForest: () => void;
}

export const useResearchStore = create<ResearchState>((set) => ({
  researchForest: null,
  loadResearchForest: () => {
    fetch(`http://localhost:8000/v1/research/forest`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data: ResearchForestData) => {
        console.log("Loaded research forest:", data);

        set({ researchForest: data });
      })
      .catch((error) => {
        console.error("Error loading research forest:", error);
      });
  },
}));
