// src/App.tsx

import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Ensure you use the correct import
import Screen from "./components/Screen";
import useUserStore from "./store/userStore";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import BuildModal from "./components/BuildModal";
import Modal from "react-modal";
import Resources from "./components/Resources";
import useModalStore from "./store/modalStore";
import useBuildStore from "./store/buildStore";

const noneModal = 0;
const loginModal = 1;
const registerModal = 2;
const buildModal = 3;

interface BuildModalData {
  x: number;
  y: number;
  entityId: string;
}

const App: React.FC = () => {
  Modal.setAppElement("#root");
  const setUserId = useUserStore((state) => state.setUserId);
  const userId = useUserStore((state) => state.userId);
  const modalState = useModalStore();
  const buildStore = useBuildStore();

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
    }
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
          setUserId(user_id); // Set user ID if token is valid
        }
      } catch (error) {
        console.error("Invalid token, showing login modal");
        modalState.setModal(loginModal);
      }
    } else {
      console.info("No token, showing login modal");
      modalState.setModal(loginModal);
    }
  }, [setUserId]);

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
                    setUserId(null);
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
        <Resources />
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
