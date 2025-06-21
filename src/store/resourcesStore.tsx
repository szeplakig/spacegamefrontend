import { create } from "zustand";

export interface ResourceDescriptor {
  amount: number;
  change: number;
  capacity: number | null;
  updated_at: string | null;
}

export interface ResourcesData {
  energy: ResourceDescriptor;
  minerals: ResourceDescriptor;
  alloys: ResourceDescriptor;
  antimatter: ResourceDescriptor;
  research: ResourceDescriptor;
  authority: ResourceDescriptor;
}

interface ResourcesState {
  resourcesData: ResourcesData;
  updateResources: () => void;
}

export const useResourcesStore = create<ResourcesState>((set) => ({
  resourcesData: {
    energy: { amount: 0, change: 0, capacity: null, updated_at: null },
    minerals: { amount: 0, change: 0, capacity: null, updated_at: null },
    alloys: { amount: 0, change: 0, capacity: null, updated_at: null },
    antimatter: { amount: 0, change: 0, capacity: null, updated_at: null },
    research: { amount: 0, change: 0, capacity: null, updated_at: null },
    authority: { amount: 0, change: 0, capacity: null, updated_at: null },
  },
  updateResources: function () {
    // Optimistic update from localStorage (synchronous)
    const lastResourceResponse = localStorage.getItem("resources_response");
    if (lastResourceResponse) {
      const cachedData: ResourcesData = JSON.parse(lastResourceResponse);
      set({ resourcesData: cachedData });
    }

    fetch(`http://localhost:8000/v1/resources`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              `HTTP error! Status: ${response.status}, Detail: ${JSON.stringify(
                data
              )}`
            );
          });
        }
        return response.json();
      })
      .then((responseData) => {
        localStorage.setItem(
          "resources_response",
          JSON.stringify(responseData)
        );
        set({ resourcesData: responseData });
      })
      .catch((error) => {
        // Handle any errors from the fetch or response processing
        console.error("Failed to update resources:", error);
      });
  },
}));
