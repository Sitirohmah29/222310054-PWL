import React, { useEffect, useState } from "react";
// Halaman dosen pembimbing terpilih dan status bimbingan
import {
  User,
  Award,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MessageCircle,
  BookOpen,
  Mail,
  Phone,
} from "lucide-react";

const SelectedLecturerPage = ({ student }) => {
  // State untuk daftar dosen yang dipilih
  const [selectedLecturers, setSelectedLecturers] = useState([]);
  // State untuk judul skripsi terbaru mahasiswa
  const [latestThesisTitle, setLatestThesisTitle] = useState("");

  useEffect(() => {
    // Ambil judul skripsi terbaru dari collection thesisTopics sesuai mahasiswa login
    if (!student?._id) return;
    fetch("http://localhost:3000/api/thesis-topics")
      .then((res) => res.json())
      .then((topics) => {
        if (Array.isArray(topics)) {
          // Filter hanya topik milik mahasiswa login
          const studentTopics = topics.filter(
            (t) =>
              t.studentsId?._id === student._id || t.studentsId === student._id
          );
          if (studentTopics.length > 0) {
            // Urutkan berdasarkan createdAt terbaru
            studentTopics.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setLatestThesisTitle(studentTopics[0].judul || "");
          } else {
            setLatestThesisTitle("");
          }
        }
      })
      .catch((err) => {
        setLatestThesisTitle("");
      });
    if (!student?._id) return;
    // Fetch latest thesis topic for this student
    fetch("http://localhost:3000/api/thesis-topics")
      .then((res) => res.json())
      .then((topics) => {
        console.log("DEBUG thesis topics:", topics);
        if (Array.isArray(topics)) {
          // Ambil topik terbaru milik mahasiswa
          const studentTopics = topics.filter(
            (t) =>
              t.studentsId?._id === student._id || t.studentsId === student._id
          );
          console.log("DEBUG studentTopics:", studentTopics);
          if (studentTopics.length > 0) {
            // Urutkan berdasarkan createdAt terbaru
            studentTopics.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            console.log("DEBUG latest thesis title:", studentTopics[0].judul);
            setLatestThesisTitle(studentTopics[0].judul || "");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch /thesis-topics:", err);
        setLatestThesisTitle("");
      });
    // Fetch selected lecturers
    fetch("http://localhost:3000/api/supervisions")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("API /supervisions did not return an array:", data);
          setSelectedLecturers([]);
          return;
        }
        // Filter hanya milik mahasiswa login
        const filtered = data.filter(
          (d) =>
            d.studentsId?._id === student._id || d.studentsId === student._id
        );
        // Map agar field selalu konsisten
        const mapped = filtered.map((d, idx) => {
          const lecturer = d.lecturersId || {};
          let currentStudents = lecturer.jumlah_bimbingan_aktif;
          if (typeof currentStudents === "string") {
            currentStudents = parseInt(currentStudents, 10) || 0;
          } else if (typeof currentStudents !== "number") {
            currentStudents = 0;
          }
          let maxStudents = lecturer.max_bimbingan;
          if (typeof maxStudents === "string") {
            maxStudents = parseInt(maxStudents, 10) || 0;
          } else if (typeof maxStudents !== "number") {
            maxStudents = 0;
          }
          return {
            key: d._id || idx,
            name: lecturer.nama || "-",
            expertise: lecturer.bidang_keahlian || [],
            matchPercentage: Math.round((d.similarityScore || 0) * 100),
            isAvailable: lecturer.cluster !== 2,
            currentStudents,
            maxStudents,
            researchAreas: (lecturer.bidang_keahlian || []).join(", "),
            publications: lecturer.publikasi?.length || 0,
            photo: <User />,
            experience:
              lecturer.riwayat_penelitian?.length > 0
                ? `${lecturer.riwayat_penelitian.length} penelitian`
                : "-",
            role: d.role || "",
            status: d.status || "pending",
            thesisTitle: latestThesisTitle,
            email: lecturer.email || "-",
            phone: lecturer.telepon || "-",
            selectedDate: d.selectedDate || "",
            responseDate: d.responseDate || "",
            lastMeeting: d.lastMeeting || "",
            meetingSchedule: d.meetingSchedule || "",
            notes: d.notes || "",
          };
        });
        setSelectedLecturers(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch /supervisions:", err);
        setSelectedLecturers([]);
      });
  }, [student]);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5" />;
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "rejected":
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "pending":
        return "Menunggu Persetujuan";
      case "rejected":
        return "Ditolak";
      default:
        return "Tidak Diketahui";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belum ada";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const approvedLecturers = selectedLecturers.filter(
    (l) => l.status === "approved"
  );
  const pendingLecturers = selectedLecturers.filter(
    (l) => l.status === "pending"
  );
  const rejectedLecturers = selectedLecturers.filter(
    (l) => l.status === "rejected"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 w-full px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📚 Dosen Pembimbing Terpilih
          </h1>
          <p className="text-gray-600 text-lg">
            Status persetujuan dosen pembimbing yang telah Anda pilih
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {approvedLecturers.length}
            </div>
            <div className="text-gray-600">Disetujui</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingLecturers.length}
            </div>
            <div className="text-gray-600">Menunggu</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-600">
              {rejectedLecturers.length}
            </div>
            <div className="text-gray-600">Ditolak</div>
          </div>
        </div>

        {/* Selected Lecturers List */}
        <div className="space-y-6">
          {selectedLecturers.map((lecturer) => (
            <div
              key={lecturer.key}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{lecturer.photo}</div>

                <div className="flex-1">
                  {/* Header with Name and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {lecturer.name}
                      </h3>
                      <p className="text-gray-600">
                        {lecturer.role === "pembimbing_1"
                          ? "Pembimbing Utama"
                          : "Pembimbing Pendamping"}
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`px-4 py-2 rounded-lg border-2 flex items-center space-x-2 ${getStatusColor(
                          lecturer.status
                        )}`}
                      >
                        {getStatusIcon(lecturer.status)}
                        <span className="font-semibold">
                          {getStatusText(lecturer.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thesis Title */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Judul Skripsi:
                    </h4>
                    <p className="text-blue-700">
                      {latestThesisTitle && latestThesisTitle !== "-"
                        ? latestThesisTitle
                        : "(Belum ada judul skripsi yang diinputkan)"}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        Bidang Penelitian:
                      </h4>
                      <p className="text-gray-600">{lecturer.researchAreas}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Pengalaman:
                      </h4>
                      <p className="text-gray-600">{lecturer.experience}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email:
                      </h4>
                      <p className="text-gray-600">{lecturer.email}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Telepon:
                      </h4>
                      <p className="text-gray-600">{lecturer.phone}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Timeline:
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        📅 Dipilih: {formatDate(lecturer.selectedDate)}
                      </p>
                      <p className="text-gray-600">
                        📋 Direspon: {formatDate(lecturer.responseDate)}
                      </p>
                      {lecturer.lastMeeting && (
                        <p className="text-gray-600">
                          🤝 Pertemuan terakhir:{" "}
                          {formatDate(lecturer.lastMeeting)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meeting Schedule (for approved lecturers) */}
                  {lecturer.status === "approved" &&
                    lecturer.meetingSchedule && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Jadwal Bimbingan:
                        </h4>
                        <p className="text-green-700">
                          {lecturer.meetingSchedule}
                        </p>
                      </div>
                    )}

                  {/* Notes */}
                  {lecturer.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Catatan:
                      </h4>
                      <p
                        className={`p-3 rounded-lg ${
                          lecturer.status === "approved"
                            ? "bg-green-50 text-green-800"
                            : lecturer.status === "rejected"
                            ? "bg-red-50 text-red-800"
                            : "bg-gray-50 text-gray-800"
                        }`}
                      >
                        {lecturer.notes}
                      </p>
                    </div>
                  )}

                  {/* Expertise Tags */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Keahlian:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {lecturer.expertise
                        .slice(0, 4)
                        .map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      {lecturer.expertise.length > 4 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          +{lecturer.expertise.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      📚 {lecturer.publications} publikasi •{" "}
                      {lecturer.currentStudents}/{lecturer.maxStudents}{" "}
                      mahasiswa aktif
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          lecturer.status === "approved"
                            ? "text-green-700"
                            : lecturer.status === "pending"
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}
                      >
                        {lecturer.role === "pembimbing_1"
                          ? "Pembimbing 1"
                          : "Pembimbing 2"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📋 Informasi Penting
          </h3>
          <div className="text-blue-700 space-y-2">
            <p>
              • Status "Menunggu Persetujuan": Dosen belum memberikan respon
              terhadap permintaan bimbingan
            </p>
            <p>
              • Status "Disetujui": Dosen bersedia menjadi pembimbing dan jadwal
              bimbingan telah ditetapkan
            </p>
            <p>
              • Status "Ditolak": Dosen tidak dapat menjadi pembimbing dengan
              alasan yang tercantum
            </p>
            <p>
              • Pastikan Anda memiliki minimal 1 pembimbing utama yang telah
              disetujui untuk melanjutkan skripsi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedLecturerPage;
