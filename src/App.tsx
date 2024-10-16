// src/App.tsx

import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Ensure you use the correct import
import Screen from "./components/Screen";
import useUserStore from "./store/userStore";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";

const App: React.FC = () => {
  const setUserId = useUserStore((state) => state.setUserId);
  const userId = useUserStore((state) => state.userId);
  const [isModalOpen, setIsModalOpen] = useState(false); // Default is false
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register modals

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token); // Ensure the correct function usage
        const { user_id, exp } = decodedToken;

        // Check if token is still valid
        if (Date.now() >= exp * 1000) {
          console.error("Token expired, showing login modal");
          setIsModalOpen(true); // Show modal if token is expired
        } else {
          setUserId(user_id); // Set user ID if token is valid
        }
      } catch (error) {
        console.error("Invalid token, showing login modal");
        setIsModalOpen(true); // Show modal if token is invalid
      }
    } else {
      // If no token exists, open login/register modal
      setIsModalOpen(true);
    }
  }, [setUserId]);

  return (
    <>
      <header
        style={{ backgroundColor: "#007bff", padding: "10px", color: "#fff" }}
      >
        <h1>Space Game</h1>
        {userId ? <p>Logged in as User: {userId}</p> : <p>Not logged in</p>}
      </header>
      <Routes>
        <Route path="/" element={<Screen />} />
      </Routes>

      {/* Conditionally show either the Login or Register modal only if user is not logged in */}
      {isModalOpen && (
        isLogin ? (
          <LoginModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )
      )}
    </>
  );
};

export default App;
