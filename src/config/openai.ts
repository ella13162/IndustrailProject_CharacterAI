import OpenAI from 'openai';

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
console.log('OpenAI API Key:', apiKey ? 'Present' : 'Missing');

if (!apiKey) {
  throw new Error('Missing OpenAI API key. Please add REACT_APP_OPENAI_API_KEY to your .env file');
}

export const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

// Test the configuration
openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'system', content: 'Test message' }],
}).catch(error => {
  console.error('OpenAI configuration test failed:', error);
});
