import React from "react";
import { User, Award, ChevronRight, UserCheck } from "lucide-react";

import { useState } from "react";

const LecturerCard = ({ lecturer, index, getMatchColor, onSelectLecturer }) => {
  // Debug log
  console.log("LecturerCard props:", lecturer);

  const [showModal, setShowModal] = useState(false);

  const handleSelectClick = () => {
    if (!lecturer.isAvailable) {
      setShowModal(true);
      return;
    }
    if (onSelectLecturer) {
      onSelectLecturer(lecturer);
    }
  };

  return (
    <div
      key={lecturer.key}
      className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${
        !lecturer.isAvailable ? "bg-gray-100 opacity-70" : "bg-white"
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{lecturer.photo}</div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {lecturer.name || "-"}
              </h3>
              <p className="text-gray-600">
                Pengalaman: {lecturer.experience || "-"}
              </p>
            </div>

            <div className="text-right">
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(
                  lecturer.matchPercentage ?? 0
                )}`}
              >
                {lecturer.matchPercentage ?? 0}% Match
              </div>
              <div
                className={`mt-1 px-2 py-1 rounded text-xs ${
                  lecturer.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {lecturer.isAvailable ? "Tersedia" : "Penuh"}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Bidang Penelitian:
              </h4>
              <p className="text-gray-600">{lecturer.researchAreas || "-"}</p>
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Kapasitas Mahasiswa:
              </h4>
              <p className="text-gray-600">
                {lecturer.currentStudents ?? 0}/{lecturer.maxStudents ?? 0}{" "}
                mahasiswa
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Keahlian:</h4>
            <div className="flex flex-wrap gap-2">
              {(lecturer.expertise ?? [])
                .slice(0, 6)
                .map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              {lecturer.expertise?.length > 6 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  +{lecturer.expertise.length - 6} lainnya
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              📚 {lecturer.publications ?? 0} publikasi
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Ranking #{index + 1}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Button Pilih Dosen */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleSelectClick}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                lecturer.isAvailable
                  ? "bg-purple-500 hover:bg-purple-700 active:bg-purple-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!lecturer.isAvailable}
              type="button"
            >
              <UserCheck className="h-5 w-5" />
              <span>
                {lecturer.isAvailable ? "Pilih Dosen Ini" : "Tidak Tersedia"}
              </span>
            </button>
            {/* Modal Popup */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                  <h2 className="text-xl font-bold text-red-600 mb-4">
                    Bimbingan Penuh
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Maaf, kapasitas bimbingan dosen ini sudah penuh. Silakan
                    pilih dosen lain yang masih tersedia.
                  </p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
                    onClick={() => setShowModal(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerCard;
