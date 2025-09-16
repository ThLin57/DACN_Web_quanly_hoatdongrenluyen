import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import http from '../services/http';

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.warn('Could not get location:', error.message);
        }
      );
    }
  }, []);

  // Start camera scanning
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Back camera preferred
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        
        // Start scanning loop
        intervalRef.current = setInterval(scanQRCode, 100);
      }
    } catch (err) {
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Scan QR code from video
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      stopCamera();
      processQRCode(code.data);
    }
  };

  // Process scanned QR code
  const processQRCode = async (qrData) => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await http.post('/attendance/scan', {
        qrData,
        location
      });

      setScanResult({
        success: true,
        message: response.data.message,
        data: response.data.data
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi điểm danh';
      setScanResult({
        success: false,
        message: errorMessage
      });
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          processQRCode(code.data);
        } else {
          setError('Không tìm thấy mã QR trong ảnh');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Reset scanner
  const resetScanner = () => {
    setScanResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Điểm danh QR</h1>
          <p className="text-gray-600 text-sm">
            Quét mã QR hoặc tải lên ảnh để điểm danh
          </p>
        </div>

        {/* Scanner Interface */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          {!scanResult && (
            <>
              {/* Camera View */}
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  className={`w-full h-64 bg-gray-200 rounded-lg ${isScanning ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {!isScanning && (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Camera chưa khởi động</p>
                    </div>
                  </div>
                )}

                {/* Scanning overlay */}
                {isScanning && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
                    <div className="absolute inset-4 border border-white border-dashed rounded"></div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                {!isScanning ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Bật camera quét QR
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Dừng quét
                  </button>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-500 text-sm">hoặc</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                  disabled={isProcessing}
                >
                  <Upload className="w-5 h-5" />
                  Tải ảnh QR từ thiết bị
                </button>
              </div>
            </>
          )}

          {/* Processing state */}
          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang xử lý điểm danh...</p>
            </div>
          )}

          {/* Result */}
          {scanResult && (
            <div className="text-center py-6">
              {scanResult.success ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-green-600 mb-2">
                    Điểm danh thành công!
                  </h3>
                  <p className="text-gray-600 mb-4">{scanResult.message}</p>
                  
                  {scanResult.data && (
                    <div className="bg-green-50 p-4 rounded-lg text-left mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Hoạt động:</strong> {scanResult.data.activityName}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Phiên:</strong> {scanResult.data.sessionName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Thời gian:</strong> {new Date(scanResult.data.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-600 mb-2">
                    Điểm danh thất bại
                  </h3>
                  <p className="text-gray-600 mb-4">{scanResult.message}</p>
                </>
              )}

              <button
                onClick={resetScanner}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quét mã khác
              </button>
            </div>
          )}

          {/* Error display */}
          {error && !scanResult && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Đảm bảo bạn đã đăng ký tham gia hoạt động</li>
            <li>• Quét QR trong thời gian điểm danh</li>
            <li>• Ở gần địa điểm tổ chức nếu có yêu cầu vị trí</li>
            <li>• Mỗi người chỉ được điểm danh một lần</li>
          </ul>
        </div>
      </div>
    </div>
  );
}