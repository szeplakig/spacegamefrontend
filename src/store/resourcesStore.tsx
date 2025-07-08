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
  resourcesData: ResourcesData | null;
  updateResources: () => void;
}

export const useResourcesStore = create<ResourcesState>((set) => ({
  resourcesData: null,
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
