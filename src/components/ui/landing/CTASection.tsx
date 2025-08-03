export default function CTASection() {
  return (
    <section
      id="section-6"
      className="py-20 px-6 text-center bg-indigo-600 text-white dark:bg-indigo-700"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Ready to Take Control of Your Team’s Time?</h2>
        <p className="text-lg mb-8">
          Start tracking. Start collaborating. Empower your remote team today with Log Pose.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="/register"
            className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition w-full md:w-fit"
          >
            I'm Ready to Jump in 
          </a>
          <a
            href="/login"
            className="border border-white text-white px-6 py-3 rounded-md hover:bg-white hover:text-indigo-600 transition w-full md:w-fit"
          >
            I'm Ready to Collaborate
          </a>
        </div>
      </div>
    </section>
  );
}
