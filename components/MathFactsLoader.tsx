
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const MATH_FACTS = [
  "A 'jiffy' is an actual unit of time: 1/100th of a second.",
  "The word 'hundred' comes from the Old Norse word 'hundrath', which actually means 120.",
  "In a room of 23 people, there's a 50% chance that two people have the same birthday.",
  "Most mathematical symbols weren't invented until the 16th century.",
  "Forty is the only number that is spelt with letters arranged in alphabetical order.",
  "One is the only number that is spelt with letters arranged in descending alphabetical order.",
  "Every odd number has an 'e' in it.",
  "Zero is the only number that cannot be represented by Roman numerals.",
  "The equals sign (=) was invented in 1557 by Welsh mathematician Robert Recorde.",
  "A 'googol' is the number 1 followed by 100 zeros.",
  "The spiral shapes of sunflowers follow the Fibonacci sequence.",
  "The number 7 is the most popular 'favorite number' in the world.",
  "If you multiply 111,111,111 by 111,111,111 you get 12,345,678,987,654,321.",
  "The sum of all numbers on a roulette wheel is 666.",
  "A 'pizza' that has radius 'z' and height 'a' has volume Pi * z * z * a.",
  "The number 0.999... is exactly equal to 1.",
  "The word 'mathematics' comes from the Greek word 'mathema', meaning 'learning' or 'study'.",
  "A 'perfect number' is a positive integer that is equal to the sum of its proper divisors. 6 is the smallest.",
  "The number 2 is the only even prime number.",
  "The symbol for infinity (∞) is called a 'lemniscate'."
];

interface MathFactsLoaderProps {
  progress: number;
}

export const MathFactsLoader: React.FC<MathFactsLoaderProps> = ({ progress }) => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % MATH_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8 w-full max-w-md mx-auto">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-indigo-100"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
            className="text-indigo-600"
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-indigo-700">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="w-full space-y-4 text-center">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="min-h-[4rem] flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-600 italic font-medium leading-relaxed"
            >
              "{MATH_FACTS[factIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
        
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Calculating Problems...
        </p>
      </div>
    </div>
  );
};
