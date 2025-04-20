import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OtpVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { verifyOTP, sendOTP, clearError } = useAuth();

  useEffect(() => {
    // Focus the first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Get data from localStorage
    const storedEmail = localStorage.getItem('authEmail');
    const storedPhone = localStorage.getItem('phoneNumber');
    
    if (storedEmail) {
      setEmail(storedEmail);
    }
    
    if (storedPhone) {
      setPhoneNumber(storedPhone);
      // Do not send OTP automatically, wait for user action
      // handleSendOTP(storedPhone);
    } else {
      setError('Phone number not found. Please go back and try again.');
    }
    
    // Ensure recaptcha container exists
    ensureRecaptchaContainer();
    
    return () => {
      // No cleanup needed here
    };
  }, []);

  // Ensure recaptcha container exists
  const ensureRecaptchaContainer = () => {
    if (!document.getElementById('recaptcha-container')) {
      const recaptchaDiv = document.createElement('div');
      recaptchaDiv.id = 'recaptcha-container';
      recaptchaDiv.style.visibility = 'hidden';
      document.body.appendChild(recaptchaDiv);
    }
  };

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0 && !canResend && otpSent) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend, otpSent]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to next input if current one is filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSendOTP = async (phone) => {
    ensureRecaptchaContainer();
    setError('');
    clearError();
    setSendingOtp(true);
    
    try {
      // Small delay to make sure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await sendOTP(phone || phoneNumber);
      // Reset countdown
      setCountdown(30);
      setCanResend(false);
      setOtpSent(true);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Join the OTP array into a single string
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    
    setError('');
    clearError();
    setIsSubmitting(true);
    
    try {
      // Verify the OTP
      await verifyOTP(otpString);
      
      // Check if this is from registration or just MFA login
      const isRegistration = localStorage.getItem('registrationMFA') === 'true';
      
      // Clear localStorage
      localStorage.removeItem('authEmail');
      localStorage.removeItem('phoneNumber');
      localStorage.removeItem('registrationMFA');
      
      // Navigate to the appropriate page
      navigate('/');
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <svg 
                className="h-10 w-10 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Phone Verification</h2>
          {!otpSent ? (
            <p className="mt-2 text-sm text-gray-600">
              We need to verify your phone number <span className="font-medium">{phoneNumber}</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to your phone <span className="font-medium">{phoneNumber}</span>
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          {!otpSent ? (
            <div className="flex justify-center">
              <button
                onClick={() => handleSendOTP()}
                disabled={sendingOtp}
                className={`w-full px-4 py-3 rounded-md text-white font-medium ${
                  sendingOtp
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                } transition-all duration-200 flex justify-center items-center`}
              >
                {sendingOtp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleVerifyOTP}
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isSubmitting ? 'bg-purple-400' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive a code?{' '}
                  {canResend ? (
                    <button
                      onClick={() => handleSendOTP()}
                      className="text-purple-600 hover:text-purple-500 font-medium"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-gray-400">
                      Resend in {countdown}s
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="flex justify-center items-center">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go back
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" style={{ visibility: 'hidden' }}></div>
    </div>
  );
};

export default OtpVerificationPage;