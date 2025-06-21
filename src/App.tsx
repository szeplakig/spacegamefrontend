import React, { useEffect } from "react";
import { Routes, Route } from "react-router";
import { jwtDecode } from "jwt-decode";
import Screen from "./components/Screen";
import useUserStore from "./store/userStore";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import BuildModal from "./components/BuildModal";
import Modal from "react-modal";
import Resources from "./components/Resources";
import useModalStore from "./store/modalStore";
import useBuildStore from "./store/buildStore";
import ResearchModal from "./components/ResearchModal";
import { useResourcesStore } from "./store/resourcesStore";

function secondsToDhms(seconds: number) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
const noneModal = 0;
const loginModal = 1;
const registerModal = 2;
const buildModal = 3;
const researchModal = 4;

const App: React.FC = () => {
  Modal.setAppElement("#root");
  const userStore = useUserStore();
  const userId = useUserStore((state) => state.userId);
  const modalState = useModalStore();
  const buildStore = useBuildStore();
  const resourceStore = useResourcesStore();

  function buildOnEntity(x: number, y: number, entityId: string) {
    modalState.setModal(buildModal);
    buildStore.setBuildModal(x, y, entityId);
  }

  function renderSelectedModal() {
    if (modalState.modal === loginModal) {
      return (
        <LoginModal
          isOpen={true}
          onClose={() => modalState.setModal(noneModal)}
          onSwitchToRegister={() => modalState.setModal(registerModal)}
        />
      );
    } else if (modalState.modal === registerModal) {
      return (
        <RegisterModal
          isOpen={true}
          onClose={() => modalState.setModal(noneModal)}
          onSwitchToLogin={() => modalState.setModal(loginModal)}
        />
      );
    } else if (modalState.modal === buildModal && buildStore.isSet()) {
      return (
        <BuildModal
          isOpen={true}
          onClose={() => modalState.setModal(noneModal)}
        />
      );
    } else if (modalState.modal === researchModal) {
      return (
        <ResearchModal
          isOpen={true}
          onClose={() => modalState.setModal(noneModal)}
        />
      );
    }
    return null;
  }

  useEffect(() => {
    if (modalState.modal !== noneModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [modalState]);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (token !== undefined) {
      try {
        const decodedToken: any = jwtDecode(token); // Ensure the correct function usage
        const { user_id, exp } = decodedToken;

        // Check if token is still valid
        if (Date.now() >= exp * 1000) {
          console.error("Token expired, showing login modal");
          modalState.setModal(loginModal);
        } else {
          userStore.setUserId(user_id); // Set user ID if token is valid
        }
      } catch (error) {
        console.error("Invalid token, showing login modal");
        modalState.setModal(loginModal);
      }
    } else {
      console.info("No token, showing login modal");
      modalState.setModal(loginModal);
    }
  }, [userId]);

  return (
    <>
      <header
        style={{
          backgroundColor: "#007bff",
          padding: "10px",
          color: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <h1
            style={{
              display: "inline-block",
            }}
          >
            Space Game
          </h1>
          <div
            style={{
              display: "inline-block",
              float: "right",
            }}
          >
            {userId ? (
              <p>
                Logged in as User: {userId}
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => {
                    userStore.setUserId(null);
                    modalState.setModal(loginModal);
                    document.cookie = "";
                  }}
                >
                  Log out
                </button>
              </p>
            ) : (
              <p>Not logged in</p>
            )}
          </div>
        </div>
        {userId && <Resources />}
        {userId && [
          <button
            style={{
              marginLeft: "20px",
              padding: "0.5rem",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => modalState.setModal(researchModal)}
          >
            🧪
          </button>,
          <button
            style={{
              marginLeft: "20px",
              padding: "0.5rem",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              const seconds = 3600; // 1 hour in seconds
              fetch(`http://localhost:8000/v1/time-warp/${seconds}`, {
                method: "POST",
                credentials: "include",
              })
                .then(() => {
                  resourceStore.updateResources(); // Update resources after time warp
                  let timeWarp = parseInt(
                    localStorage.getItem(`time-warp-${userId}`) ?? "0",
                    10
                  );
                  timeWarp += seconds;
                  localStorage.setItem(
                    `time-warp-${userId}`,
                    timeWarp.toString()
                  );
                })
                .catch((error) => {
                  console.error("Error during time warp:", error);
                });
            }}
          >
            1 hour
          </button>,
          <button
            style={{
              marginLeft: "20px",
              padding: "0.5rem",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              const seconds = 86400; // 1 day in seconds
              fetch(`http://localhost:8000/v1/time-warp/${seconds}`, {
                method: "POST",
                credentials: "include",
              })
                .then(() => {
                  resourceStore.updateResources(); // Update resources after time warp
                  let timeWarp = parseInt(
                    localStorage.getItem(`time-warp-${userId}`) ?? "0",
                    10
                  );
                  timeWarp += seconds;
                  localStorage.setItem(
                    `time-warp-${userId}`,
                    timeWarp.toString()
                  );
                })
                .catch((error) => {
                  console.error("Error during time warp:", error);
                });
            }}
          >
            1 day
          </button>,
          <button
            style={{
              marginLeft: "20px",
              padding: "0.5rem",
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              const seconds = 604800; // 1 week in seconds
              fetch(`http://localhost:8000/v1/time-warp/${seconds}`, {
                method: "POST",
                credentials: "include",
              })
                .then(() => {
                  resourceStore.updateResources(); // Update resources after time warp
                  let timeWarp = parseInt(
                    localStorage.getItem(`time-warp-${userId}`) ?? "0",
                    10
                  );
                  timeWarp += seconds;
                  localStorage.setItem(
                    `time-warp-${userId}`,
                    timeWarp.toString()
                  );
                })
                .catch((error) => {
                  console.error("Error during time warp:", error);
                });
            }}
          >
            1 week
          </button>,
          <span>
            {secondsToDhms(
              parseInt(localStorage.getItem(`time-warp-${userId}`) ?? "0")
            )}
          </span>,
        ]}
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <Screen isLoggedIn={!!userId} buildOnEntity={buildOnEntity} />
          }
        />
      </Routes>

      {modalState.modal !== noneModal && renderSelectedModal()}
    </>
  );
};

export default App;
