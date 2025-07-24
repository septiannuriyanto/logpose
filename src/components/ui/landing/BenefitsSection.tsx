'use client';
import { useEffect, useState } from 'react';

const benefits = [
  {
    image: '/images/chart.png',
    title: 'Boost Productivity by 15%',
    desc: 'Teams using Log Pose reported a 15% increase in productivity after just one month of usage.',
  },
  {
    image: '/images/time.png',
    title: 'Cut Reporting Time by 80%',
    desc: 'Automated time logs and exports help reduce weekly reporting efforts by up to 80%.',
  },
  {
    image: '/images/target.png',
    title: 'Improve Task Accuracy by 25%',
    desc: 'Real-time progress tracking improves clarity and focus, increasing task accuracy significantly.',
  },
];

export default function BenefitsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % benefits.length);
        setFade(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const benefit = benefits[currentIndex];

  return (
    <section
      id="section-5"
      className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500"
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">What You’ll Gain</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-12">
          Real numbers. Real impact. See how Log Pose transforms the way remote teams work.
        </p>

        {/* Image + Content */}
        <div
          className={`relative transition-opacity duration-500 ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={benefit.image}
            alt={benefit.title}
            className="w-full h-80 object-cover rounded-xl shadow-lg mb-8"
          />

          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{benefit.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {benefit.desc}
          </p>
        </div>
      </div>
    </section>
  );
}
