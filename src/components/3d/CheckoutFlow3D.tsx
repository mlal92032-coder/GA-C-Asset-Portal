'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface CheckoutFlowProps {
  assetId: string;
  assetName: string;
  onComplete?: () => void;
  flowType?: 'checkout' | 'checkin';
}

export default function CheckoutFlow3D({
  assetId,
  assetName,
  onComplete,
  flowType = 'checkout',
}: CheckoutFlowProps) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    {
      title: `${flowType === 'checkout' ? 'Verify' : 'Return'} Asset`,
      description: `Scanning ${assetName}...`,
      icon: <Clock className="w-12 h-12" />,
    },
    {
      title: `${flowType === 'checkout' ? 'Assign' : 'Collect'} to User`,
      description: 'Selecting recipient...',
      icon: '👤',
    },
    {
      title: 'Confirm Details',
      description: 'Reviewing information...',
      icon: '✓',
    },
  ];

  const handleNext = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      }
    } catch (err) {
      setError('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, scale: 0.8 },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20, rotateX: 90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
    exit: { opacity: 0, y: -20, rotateX: -90 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ perspective: 1200 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {/* Success Screen */}
        {success ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <div
              className="relative bg-white rounded-2xl p-8 overflow-hidden"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(59, 130, 246, 0.1),
                  0 20px 60px rgba(59, 130, 246, 0.3),
                  0 40px 80px rgba(0, 0, 0, 0.2)
                `,
                transform: 'translateZ(0)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Success Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 1,
                }}
                className="text-center mb-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 text-center mb-2"
              >
                {flowType === 'checkout' ? 'Checked Out' : 'Returned'} Successfully!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-gray-600 mb-6"
              >
                <strong>{assetName}</strong> has been {flowType === 'checkout' ? 'checked out' : 'returned'} successfully.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-gray-500"
              >
                Closing in a moment...
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Workflow Screen */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <div
              className="relative bg-white rounded-2xl overflow-hidden"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(59, 130, 246, 0.1),
                  0 20px 60px rgba(59, 130, 246, 0.3),
                  0 40px 80px rgba(0, 0, 0, 0.2)
                `,
              }}
            >
              {/* Top Light */}
              <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{ transform: 'translateZ(10px)' }}
              />

              {/* Progress Bar */}
              <div className="h-2 bg-gray-200">
                <motion.div
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center"
                  >
                    {/* Icon */}
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="text-6xl mb-4 inline-block"
                    >
                      {steps[step].icon}
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {steps[step].title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">
                      {steps[step].description}
                    </p>

                    {/* Step indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                      {steps.map((_, idx) => (
                        <motion.div
                          key={idx}
                          animate={{
                            scale: idx === step ? 1.2 : 1,
                            backgroundColor: idx <= step ? '#3B82F6' : '#E5E7EB',
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-2 h-2 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0 || isLoading}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg
                             disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
                  >
                    Back
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg
                             disabled:opacity-50 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </>
                    ) : step === steps.length - 1 ? (
                      'Complete'
                    ) : (
                      'Next'
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Bottom shine */}
              <div
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"
                style={{ transform: 'translateZ(5px)' }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
