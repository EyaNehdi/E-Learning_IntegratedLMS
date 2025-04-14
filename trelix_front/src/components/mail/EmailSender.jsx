// src/components/EmailSender.js
import React, { useState } from 'react';
import axios from 'axios';

const EmailSender = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await axios.post('http://localhost:5000/api/send-email', {
        to: formData.to,
        subject: formData.subject,
        html: `<p>${formData.message}</p>`, // use 'html' field as expected by backend
      });

      console.log('Server response:', response.data);
      setStatus('✅ Email sent successfully!');
    } catch (error) {
      console.error('❌ Error sending email:', error.response?.data || error.message);
      setStatus('❌ Failed to send email.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Send an Email</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>To:</label><br />
          <input
            type="email"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <br />
        <div>
          <label>Subject:</label><br />
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <br />
        <div>
          <label>Message:</label><br />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <br />
        <button type="submit" style={{ padding: '10px 20px' }}>Send Email</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default EmailSender;
