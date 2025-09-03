// Simple test server to simulate the Netlify function
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock function to test the logic
app.post('/.netlify/functions/create-razorpay-order', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    // Simulate the response for testing
    const mockResponse = {
      order: {
        id: 'order_test_123',
        entity: 'order',
        amount: req.body.amount * 100,
        currency: req.body.currency,
        receipt: req.body.receipt,
        status: 'created'
      },
      checkout_config: {
        key: 'rzp_test_sample_key',
        order_id: 'order_test_123',
        currency: req.body.currency,
        amount: req.body.amount * 100,
        name: 'Nirchal',
        description: 'Payment for Nirchal order',
        prefill: {
          email: req.body.customer_email,
          contact: req.body.customer_phone
        },
        theme: {
          color: '#f59e0b'
        }
      }
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = 8000;
app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
  console.log('Function endpoint: http://localhost:8000/.netlify/functions/create-razorpay-order');
});
