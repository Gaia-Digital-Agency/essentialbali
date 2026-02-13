import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
const applyJob = async (id, data) => {
  const formData = new FormData();
  formData.append("fileCV", data.fileCV, data.fileCV.name);
  formData.append("applicant_email", data.applicant_email);
  formData.append("phone", data.phone);
  const apply = await apiClient.post(`job/apply/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  if (apply.data.status_code == 200) {
    return true;
  } else {
    return false;
  }
};
const getAllApplicant = async (page, limit) => {
  try {
    const response = await apiClient.get("/job/applicant?page=" + page + "&limit=" + limit);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export {
  applyJob as a,
  getAllApplicant as g
};
