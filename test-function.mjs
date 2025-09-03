import { handler } from './netlify/functions/create-razorpay-order.js';

// Mock event and context for testing
const mockEvent = {
  httpMethod: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'INR',
    receipt: 'test_receipt_12345',
    customer_email: 'test@example.com',
    customer_phone: '9999999999'
  }),
  path: '/.netlify/functions/create-razorpay-order',
  queryStringParameters: null,
  isBase64Encoded: false
};

const mockContext = {
  functionName: 'create-razorpay-order',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:create-razorpay-order',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/create-razorpay-order',
  logStreamName: '2023/01/01/[$LATEST]test-log-stream',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {}
};

async function testFunction() {
  try {
    console.log('Testing create-razorpay-order function...');
    const result = await handler(mockEvent, mockContext);
    console.log('Function result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Function error:', error);
  }
}

testFunction();
