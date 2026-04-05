import axios from "axios";

const API = axios.create({
  baseURL: "https://recallix.onrender.com",
  withCredentials:true
});

// Add Item
export const createItemAPI = (url, token) => {
  return API.post(
    "/api/items",
    { url },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Get Items
export const getItemsAPI = (token) => {
  return API.get("/api/items", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete Item
export const deleteItemAPI = (id, token) => {
  return API.delete(`/api/items/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
