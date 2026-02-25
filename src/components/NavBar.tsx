import React from "react";

export default function NavBar() {
  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      height: "56px",
      background: "#222",
      padding: "0 16px"
    }}>
      <img
        src="/myCannon.png"
        alt="Brand Logo"
        style={{ height: "40px", marginRight: "12px" }}
      />
      <span style={{ color: "#fff", fontWeight: "bold", fontSize: "20px" }}>
        대포 뽑기
      </span>
    </nav>
  );
}
