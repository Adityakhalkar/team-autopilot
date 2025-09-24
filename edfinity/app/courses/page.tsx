'use client';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Black Section with Courses Title */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-normal text-left">
            Courses
          </h1>
        </div>
      </section>

      {/* Filter Section - Light Gray Background */}
      <section className="bg-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-normal text-center text-black">
            Filter section
          </h2>
        </div>
      </section>

      {/* Course Cards Section - Black Background */}
      <section className="bg-black py-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Course Card 1 */}
            <div className="bg-gray-300 rounded-3xl h-64"></div>

            {/* Course Card 2 */}
            <div className="bg-gray-300 rounded-3xl h-64"></div>

            {/* Course Card 3 */}
            <div className="bg-gray-300 rounded-3xl h-64"></div>

            {/* Course Card 4 */}
            <div className="bg-gray-300 rounded-3xl h-64"></div>
          </div>
        </div>
      </section>
    </div>
  );
}