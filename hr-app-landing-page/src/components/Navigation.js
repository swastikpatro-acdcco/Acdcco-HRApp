import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Navigation = ({ currentPage, onPageChange = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Zustand global auth state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;
      navbar.style.background =
        window.scrollY > 50 ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(sectionId);
      if (el) {
        const NAV_OFFSET = 88;
        const y = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
        window.scrollTo({ 
          top: y, 
          behavior: 'smooth' 
        });
        setIsMenuOpen(false);
      } else if (attempt < 6) {
        requestAnimationFrame(() => tryScroll(attempt + 1));
      } else {
        setIsMenuOpen(false);
      }
    };
    tryScroll();
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    setIsMenuOpen(false);

    if (page === "dashboard") {
      navigate("/employee-dashboard");
    } else if (page === "landing" || page === "home") {
      navigate("/dashboard");
    }
  };

  // Logout handler using Zustand
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a
          href="#"
          className="nav-logo"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange('landing');
          }}
        >
          ACDC HR
        </a>

        {/* Hamburger toggle */}
        <div className={`nav-toggle ${isMenuOpen ? "open" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Menu items */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('dashboard');
              }}
            >
              Dashboard
            </a>
          </li>

          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'landing' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
              }}
            >
              Home
            </a>
          </li>

          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
                scrollToSection('employees');
              }}
            >
              Employees
            </a>
          </li>

          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
                scrollToSection('add-employee');
              }}
            >
              Add Employee
            </a>
          </li>

          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
                scrollToSection('contact');
              }}
            >
              Support
            </a>
          </li>

          {isAuthenticated && (
            <li className="logout-item">
              <a
                href="#"
                className="nav-link logout-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
