import React, { useEffect, useState } from "react";
import { getBatches, updateBatchYear } from "../API/batch.api";
import { MdOutlineSchool, MdArrowForward } from "react-icons/md";

const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [updating, setUpdating] = useState(false);

  const yearProgression = {
    FY: "SY",
    SY: "TY",
    TY: "Alumni",
  };

  const yearColors = {
    FY: "bg-blue-100 text-blue-800",
    SY: "bg-green-100 text-green-800",
    TY: "bg-purple-100 text-purple-800",
    Alumni: "bg-gray-100 text-gray-800",
  };

  // Fetch batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await getBatches();
        setBatches(res.batches || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch batches:", err);
        setError("Failed to load batches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const handlePromoteYear = (batch) => {
    if (batch.year === "Alumni") {
      setError("Cannot promote Alumni students further");
      return;
    }

    setSelectedBatch(batch);
    setNewYear(yearProgression[batch.year]);
    setShowConfirmModal(true);
  };

  const handleConfirmPromotion = async () => {
    if (!selectedBatch || !newYear) return;

    try {
      setUpdating(true);
      const res = await updateBatchYear(
        selectedBatch.department._id,
        selectedBatch.year,
        newYear
      );

      setSuccessMessage(res.message);

      // Refresh batches
      const updatedBatches = await getBatches();
      setBatches(updatedBatches.batches || []);

      // Reset modal
      setShowConfirmModal(false);
      setSelectedBatch(null);
      setNewYear("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update batch:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update batch. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading batches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 rounded-lg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MdOutlineSchool className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
          </div>
          <p className="text-sm text-gray-500">
            Manage student cohorts and promote years across departments
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">About Batches</h3>
          <p className="text-sm text-blue-800">
            Batches represent cohorts of students in the same department and year level.
            Use the promote button to advance an entire batch to the next year level
            (e.g., FY → SY, SY → TY, TY → Alumni).
          </p>
        </div>

        {/* Batches Grid */}
        {batches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No batches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((batch, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Department & Year Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {batch.department.name}
                    </h3>
                    <p className="text-xs text-gray-500">{batch.department.code}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      yearColors[batch.year] || yearColors.FY
                    }`}
                  >
                    {batch.year}
                  </span>
                </div>

                {/* Student Count */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Students in Batch</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {batch.studentCount}
                  </p>
                </div>

                {/* Promote Button */}
                <button
                  onClick={() => handlePromoteYear(batch)}
                  disabled={batch.year === "Alumni"}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    batch.year === "Alumni"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  <span>Promote to {yearProgression[batch.year] || "N/A"}</span>
                  <MdArrowForward className="w-4 h-4" />
                </button>

                {batch.year === "Alumni" && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Alumni cannot be promoted further
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Year Promotion
            </h3>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                You are about to promote <strong>{selectedBatch.studentCount}</strong> students from:
              </p>

              <div className="flex items-center gap-3 justify-center mb-4">
                <div className="text-center">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${yearColors[selectedBatch.year]}`}>
                    {selectedBatch.year}
                  </span>
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedBatch.department.name}
                  </p>
                </div>

                <MdArrowForward className="w-5 h-5 text-gray-400" />

                <div className="text-center">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${yearColors[newYear]}`}>
                    {newYear}
                  </span>
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedBatch.department.name}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                This action will update all students' year field and cannot be undone easily.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBatch(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPromotion}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                {updating ? "Promoting..." : "Confirm Promotion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBatches;
