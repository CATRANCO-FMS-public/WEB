"use client";
import React, { useState } from "react";

import {
  createFeedbackLog,
  generateOTP,
  verifyPhoneNumber,
} from "../../../../services/feedbackService";

const FeedbackForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState("initial");
  const [busNumber, setBusNumber] = useState("002");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [feedbackLogsId, setFeedbackLogsId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Submit feedback data
  const handleSubmitFeedback = async () => {
    if (!busNumber || rating === 0 || !comments.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      const feedbackData = { vehicle_id: busNumber, rating, comments };
      const response = await createFeedbackLog(feedbackData);
      setFeedbackLogsId(response.feedback_logs_id);
      setCurrentStep("phoneInput");
    } catch (error) {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for phone number verification
  const handlePhoneInputSubmit = async () => {
    if (!phoneNumber.trim()) {
      alert("Please enter a valid phone number.");
      return;
    }
    try {
      setLoading(true);
      await generateOTP({
        phone_number: phoneNumber,
        feedback_logs_id: feedbackLogsId,
      });
      setCurrentStep("verification");
    } catch (error) {
      alert("Failed to generate OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify the phone number using OTP
  const handleVerificationSubmit = async () => {
    if (!verificationCode.trim()) {
      alert("Please enter the verification code.");
      return;
    }
    try {
      setLoading(true);
      await verifyPhoneNumber(feedbackLogsId?.toString() || "", {
        phone_number: phoneNumber,
        otp: verificationCode,
      });
      setCurrentStep("thankYou");
    } catch (error) {
      alert("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-teal-100 to-indigo-100 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Bus Header - Always visible */}
        <div className="bg-blue-600 text-white py-3 px-4 rounded-t-lg text-center mb-0.5 shadow-md">
          <h1 className="text-xl md:text-2xl font-bold">CATRANCO Bus 002</h1>
        </div>

        {currentStep === "initial" && (
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-b-lg shadow-lg text-center transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">
              We Value Your Feedback
            </h2>
            <p className="text-gray-600 mb-6">
              Help us improve our service by sharing your experience with us.
            </p>
            <button
              onClick={() => setCurrentStep("feedback")}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md text-lg font-medium"
            >
              Start Feedback
            </button>
          </div>
        )}

        {currentStep === "feedback" && (
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-b-lg shadow-lg transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Rate Your Experience</h2>
            
            <div className="mb-6 w-full">
              <label className="block mb-2 text-gray-700 font-medium">
                How was your journey today?
              </label>
              <div className="flex justify-center space-x-4 text-3xl md:text-4xl mb-2">
                {[1, 2, 3, 4, 5].map((index) => (
                  <span
                    key={index}
                    className={`cursor-pointer transform hover:scale-110 transition-transform duration-200 ${
                      rating >= index ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setRating(index)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Average"}
                {rating === 4 && "Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>
            
            <div className="w-full mb-6">
              <label className="block mb-2 text-gray-700 font-medium">
                Share your thoughts
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              />
            </div>
            
            <button
              onClick={handleSubmitFeedback}
              disabled={loading || rating === 0 || !comments.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed text-lg font-medium"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        )}

        {currentStep === "phoneInput" && (
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-b-lg shadow-lg transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Verify Your Number</h2>
            <p className="text-gray-600 mb-6 text-center">
              Please enter your phone number to verify your feedback
            </p>
            
            <div className="w-full mb-6">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
            
            <button
              onClick={handlePhoneInputSubmit}
              disabled={loading || !phoneNumber.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed text-lg font-medium"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {currentStep === "verification" && (
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-b-lg shadow-lg transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Enter Verification Code</h2>
            <p className="text-gray-600 mb-6 text-center">
              We've sent a verification code to {phoneNumber}
            </p>
            
            <div className="w-full mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the 6-digit code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-wider text-center"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={handleVerificationSubmit}
              disabled={loading || !verificationCode.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed text-lg font-medium"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}

        {currentStep === "thankYou" && (
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-white rounded-b-lg shadow-lg text-center transition-all duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">
              Thank You For Your Feedback!
            </h2>
            <p className="text-gray-600 mb-6">
              Your input helps us improve our service for everyone.
            </p>
            <button
              onClick={() => setCurrentStep("initial")}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md text-lg font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackForm;
