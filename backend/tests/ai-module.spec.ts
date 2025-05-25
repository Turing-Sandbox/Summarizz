import axios from 'axios';
import { describe, it, expect } from '@jest/globals';

const API_URL = 'http://localhost:3000';

describe('Summarization Route Tests', () => {
  it('should return a summary for valid input', async () => {
    try {
      const response = await axios.post(`${API_URL}/ai/summarize`, {
        text: 'This is a long text that needs summarizing. It contains multiple sentences and should be long enough to be summarized effectively by the AI model. The summary should capture the main points while being concise and clear.',
        options: { model: 'gemini-2.0-flash' }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data).toHaveProperty('summary');
      expect(typeof response.data.data.summary).toBe('string');
    } catch (error: any) {
      console.error('Test failed with error:', error.response?.data || error.message);
      throw error;
    }
  });

  it('should return 400 for invalid input', async () => {
    try {
      await axios.post(`${API_URL}/ai/summarize`, {}); // Missing required content
      // If we reach here, the test should fail
      expect(true).toBe(false); // This line should not be reached
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('error');
    }
  });
});
