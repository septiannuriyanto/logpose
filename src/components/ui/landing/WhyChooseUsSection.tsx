export default function WhyChooseUsSection() {
  return (
    <section
      id="section-2"
      className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-500"
    >
      <div className="max-w-5xl mx-auto text-center text-gray-800 dark:text-white">
        <h2 className="text-3xl font-bold mb-4">Why Choose Log Pose?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Designed for remote-first teams, Log Pose helps you gain clarity, accountability, and real momentum in daily operations.
        </p>

        <div className="grid gap-8 md:grid-cols-3 text-left">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Remote-Ready</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built from the ground up for asynchronous, globally distributed teams. No more timezone confusion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Simple & Transparent</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Intuitive interface makes it easy to track time, view progress, and stay aligned — without micromanagement.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Flexible & Scalable</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Whether you’re a team of 3 or 300, Log Pose scales with you and grows as your needs evolve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
