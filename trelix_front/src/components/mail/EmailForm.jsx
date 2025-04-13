// src/components/EmailForm.js
import React, { useState } from 'react';
import sendEmail from './sendEmail';


const EmailForm = () => {
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
      const response = await sendEmail(formData);
      setStatus('Email sent successfully!');
      console.log(response);
    } catch (error) {
      setStatus('Failed to send email.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        To:
        <input type="email" name="to" value={formData.to} onChange={handleChange} required />
      </label>
      <br />
      <label>
        Subject:
        <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
      </label>
      <br />
      <label>
        Message:
        <textarea name="message" value={formData.message} onChange={handleChange} required />
      </label>
      <br />
      <button type="submit">Send Email</button>
      <p>{status}</p>
    </form>
  );
};

export default EmailForm;
