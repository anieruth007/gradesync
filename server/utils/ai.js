const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const ask = async (prompt) => {
  const completion = await client.chat.completions.create({
    model: 'meta/llama-3.1-8b-instruct',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 1024,
  });
  return completion.choices[0].message.content;
};

const generateSummary = async (content) => {
  try {
    const prompt = `Summarize the following course material content in a comprehensive but concise way. Format the response as a single cohesive paragraph.\n\nContent: ${content}`;
    return await ask(prompt);
  } catch (error) {
    console.error('NVIDIA Summary Error:', error.message);
    return 'Summary generation failed';
  }
};

const generateNotes = async (content) => {
  try {
    const prompt = `Extract exactly 5 key learning notes or bullet points from the following course material content. Format the response as a simple list of 5 lines, without any numbering or specialized characters at the start of each line.\n\nContent: ${content}`;
    const text = await ask(prompt);
    return text.split('\n').filter(line => line.trim() !== '');
  } catch (error) {
    console.error('NVIDIA Notes Error:', error.message);
    return ['Key notes generation failed'];
  }
};

const generateFlashcards = async (content) => {
  try {
    const prompt = `From the following course material, identify 5 core concepts and create flashcards for them. Each flashcard should have a 'front' (question or concept name) and a 'back' (answer or explanation). Format the response as a JSON array of objects with 'front' and 'back' keys. Return only the JSON array, no extra text.\n\nContent: ${content}`;
    const text = (await ask(prompt)).replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('NVIDIA Flashcards Error:', error.message);
    return [];
  }
};

const generateQuiz = async (content) => {
  try {
    const prompt = `Create 5 multiple choice questions from the following course material. Each question should have a 'question', 4 'options', and a 'correctAnswer' which must be the EXACT full text of the correct option (not a letter like A or B). Identify which specific 'concept' or 'topic' each question addresses. Format the response as a JSON array of objects with keys 'question', 'options' (array), 'correctAnswer', and 'concept'. Return only the JSON array, no extra text.\n\nContent: ${content}`;
    const text = (await ask(prompt)).replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('NVIDIA Quiz Error:', error.message);
    return [];
  }
};

const generateTeacherInsights = async (performanceData) => {
  try {
    const dataString = performanceData.map(d => `${d.concept}: ${d.isCorrect ? 'Correct' : 'Incorrect'}`).join('\n');
    const prompt = `Analyze the following student performance data (concept name followed by result). Identify the top 3 concepts that students are struggling with most (highest incorrect rate). For each concept, provide a brief 'reteaching strategy' or 'suggestion' for the teacher. Format the response as a JSON array of objects with keys 'concept', 'errorRate' (percentage), and 'suggestion'. Return only the JSON array, no extra text.\n\nPerformance Data:\n${dataString}`;
    const text = (await ask(prompt)).replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('NVIDIA Insights Error:', error.message);
    return [];
  }
};

module.exports = {
  generateSummary,
  generateNotes,
  generateFlashcards,
  generateQuiz,
  generateTeacherInsights
};
