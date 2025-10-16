import React from 'react';

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>ACDC HR Management</h1>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => scrollToSection('add-employee')}>
              <i className="fas fa-user-plus"></i>
              Add New Employee
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('employees')}>
              <i className="fas fa-users"></i>
              View All Employees
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
