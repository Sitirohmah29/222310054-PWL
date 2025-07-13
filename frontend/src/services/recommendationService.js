import axios from "axios";

// Ambil semua dosen
export const fetchLecturers = async () => {
  const res = await axios.get("/api/lecturers");
  return res.data;
};

// Simpan topik skripsi, return id
export const saveThesisTopic = async (topic) => {
  const res = await axios.post("/api/thesis-topics", topic);
  return res.data;
};

// Kirim permintaan rekomendasi
export const getRecommendations = async ({
  thesis_topicsId,
  topic_text,
  lecturers,
}) => {
  const res = await axios.post("/api/recommendations", {
    thesis_topicsId,
    topic_text,
    lecturers,
  });
  return res.data;
};
