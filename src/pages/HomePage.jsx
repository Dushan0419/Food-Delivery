import React from "react";
import "../styles/home.css";
import { db } from "../firebase";


const Home = () => {
  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">More than Faster</span>

          <h1>
            Feast Your Senses,<br />
            <span>Fast and Fresh</span>
          </h1>

          <p>
            Order delicious food delivered to your door in minutes.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-outline">Watch Video</button>
          </div>
        </div>

        <div className="hero-image"></div>
      </section>

    </div>
  );
};

export default Home;
