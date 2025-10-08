import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <h2 className="section-title">IT Support</h2>
        <p className="section-subtitle">Need help with the HR system? Contact our IT support team</p>
        
        <div className="contact-info">
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h4>Email Support</h4>
            <p>it-support@acdc.com<br />hr-help@acdc.com</p>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-phone"></i>
            </div>
            <h4>Phone Support</h4>
            <p>Ext: 1234<br />Mon-Fri 9AM-5PM</p>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <h4>Support Tickets</h4>
            <p>Create a ticket<br />help.acdc.com</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
