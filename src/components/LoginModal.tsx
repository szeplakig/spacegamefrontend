// src/components/LoginModal.tsx

import React, { useState } from "react";
import Modal from "react-modal";
import useUserStore from "../store/userStore";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "1000px",
    backgroundColor: "#fefefe",
    padding: "20px",
    borderRadius: "8px",
    maxHeight: "90vh",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUserId = useUserStore((state) => state.setUserId);

  const handleLogin = async () => {
    const response = await fetch("http://localhost:8000/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      document.cookie = `access_token=${data.access_token}; path=/;`;
      setUserId(data.id);
      onClose();
    } else {
      console.error("Login failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Login Modal"
    >
      <h2>Login</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <button onClick={onSwitchToRegister}>Switch to Register</button>
    </Modal>
  );
};

export default LoginModal;
