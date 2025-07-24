import React from 'react'

const TestimonialsSection = () => {
  return (
    <section
  id="section-2"
  className="py-20 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
>
  <div className="max-w-5xl mx-auto text-center">
    <h2 className="text-3xl font-bold mb-4">Trusted by remote workers worldwide</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-12">
      Timezones are no longer a barrier. Log Pose helps teams in different locations stay connected and productive.
    </p>

    <div className="grid gap-8 md:grid-cols-3">
      {/* Testimonial 1 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-center mb-4">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.538 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.783.57-1.838-.197-1.538-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
              </svg>
            ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          “It is very helpful to record my daily working hours without any hassle. I can focus on work and the team can monitor the progress clearly.”
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white">Diana - Frontend Developer</h4>
      </div>

      {/* Testimonial 2 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-center mb-4">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.538 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.783.57-1.838-.197-1.538-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
              </svg>
            ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          “We have team members in 3 different countries. Log Pose helps everyone stay in sync. No more guessing who is working on what.”
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white">Yusuf - Project Manager</h4>
      </div>

      {/* Testimonial 3 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex items-center justify-center mb-4">
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.462a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.538 1.118l-3.39-2.462a1 1 0 00-1.175 0l-3.39 2.462c-.783.57-1.838-.197-1.538-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
              </svg>
            ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          “Log Pose makes weekly timesheets super easy. Reports are just a click away, and management immediately knows my progress.”
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white">Raka - Backend Engineer</h4>
      </div>
    </div>
  </div>
</section>
  )
}

export default TestimonialsSection
