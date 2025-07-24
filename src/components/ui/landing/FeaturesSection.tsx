import React from 'react';

const FeaturesSection = () => {
  return (
    <section
      id="section-4"
      className="py-20 px-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-12">
          Everything you need to manage remote teams, track time, and boost productivity — all in one platform.
        </p>

        <div className="grid gap-8 md:grid-cols-3 text-left">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-indigo-600 dark:text-indigo-400 mb-4 text-4xl">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Interactive Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get real-time insights on team activity with clear visualizations and interactive tools.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-indigo-600 dark:text-indigo-400 mb-4 text-4xl">📈</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Automated Reporting</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically generate weekly and monthly reports — no more manual calculations.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <div className="text-indigo-600 dark:text-indigo-400 mb-4 text-4xl">⏱️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real-Time Progress Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track project progress live, stay aligned with your team, and never miss a beat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
