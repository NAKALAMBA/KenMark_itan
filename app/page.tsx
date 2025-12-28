import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Kenmark ITan Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your trusted technology partner for innovative solutions
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              About Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Kenmark ITan Solutions is a leading technology company focused on delivering
              cutting-edge AI solutions, consulting services, and comprehensive training programs.
              We help businesses transform their operations through innovative technology.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Our mission is to empower organizations with intelligent solutions that drive
              growth and efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                AI Solutions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Custom AI implementations tailored to your business needs
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Consulting
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Expert technology consulting to guide your digital transformation
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Training
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive training programs to upskill your team
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Visit our website at{" "}
              <a
                href="https://kenmarkitan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                kenmarkitan.com
              </a>
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

