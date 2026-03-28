import axios from "axios";

export const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      "https://api.mistral.ai/v1/embeddings",
      {
        model: "mistral-embed",
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
      }
    );

    return response.data.data[0].embedding;

  } catch (error) {
    console.error("Embedding Error:", error.message);
    return [];
  }
};
