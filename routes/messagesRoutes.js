const express = require('express');
const router = express.Router();
const { authMiddleware } = require('clerk');

// Sample messages data (replace with your actual data)
const messages = [
  { sender: 'User 1', recipient: 'User 2', text: 'Hello, are you available for climbing this weekend?' },
  { sender: 'User 2', recipient: 'User 1', text: 'Yes, Im available. Lets meet at the climbing gym.' },
  // Add more messages
];

// Route handler for sending and retrieving messages
router.get('/messages', authMiddleware, (req, res) => {
  // Implement logic to retrieve messages between users
  // For this example, we're using sample data
  const { sender, recipient } = req.query;
  const userMessages = messages.filter((message) => {
    return (message.sender === sender && message.recipient === recipient) || (message.sender === recipient && message.recipient === sender);
  });

  res.status(200).json(userMessages);
});

router.post('/messages', authMiddleware, (req, res) => {
  // Implement logic to send messages between users
  // For this example, we're adding messages to the sample data
  const { sender, recipient, text } = req.body;
  messages.push({ sender, recipient, text });

  res.status(201).json({ message: 'Message sent successfully' });
});

module.exports = router;