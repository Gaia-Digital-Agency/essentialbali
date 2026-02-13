import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
const subscribeNewsletter = async (email) => {
  try {
    const response = await apiClient.post("newsletter/subscribe", { email });
    return response.data;
  } catch (error) {
    console.error("BIBRAH => ", error);
    throw error;
  }
};
const getTotalSubscriber = async () => {
  try {
    const response = await apiClient.get("newsletter/admin/count-subscribers");
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export {
  getTotalSubscriber as g,
  subscribeNewsletter as s
};
