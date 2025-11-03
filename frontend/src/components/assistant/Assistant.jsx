import { useState } from 'react';
import { assistantAPI } from '../../api/axios';

const Assistant = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await assistantAPI.askQuestion(question);
      
      setResponse(response.data.answer);
    } catch (error) {
      console.error('Error getting response from assistant:', error);
      setError('Failed to get a response from the assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-container">
      <h1>Smart Assistant</h1>
      <p>Ask questions about your products, sales, or business insights.</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="assistant-form">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Ask'}
        </button>
      </form>
      
      {response && (
        <div className="assistant-response">
          <h3>Response:</h3>
          <div className="response-content">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;