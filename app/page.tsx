import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CheckCircle2, FileText, Zap, Clock, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">LeaveHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-purple-400 hover:bg-purple-500 text-white rounded-full px-6 font-medium">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            SLMS - Smart Leave Management System
          </div>
          <div className="inline-block bg-purple-200 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Simplified Leave Management
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Smart Leave Management System
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Streamlined leave requests for MITS students. Submit, track, and get approvals from coordinators and HODs in minutes, not days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button className="bg-purple-400 hover:bg-purple-500 text-white px-8 py-6 text-lg font-semibold rounded-full h-auto">
                Sign Up
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-6 text-lg font-semibold rounded-full h-auto">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 text-sm">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600 text-sm">Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">24hrs</div>
              <div className="text-gray-600 text-sm">Avg Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-purple-50 to-green-50 border-t border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Simple, transparent, and efficient leave management for everyone</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                icon: <FileText className="w-6 h-6" />,
                title: 'Student Submits',
                desc: 'Create a new leave request with reason and dates. Our system validates everything.',
                bg: 'bg-purple-200',
                color: 'text-purple-700'
              },
              {
                num: '2',
                icon: <Clock className="w-6 h-6" />,
                title: 'Coordinator Reviews',
                desc: 'Class coordinators review and provide feedback. Fast approval process.',
                bg: 'bg-green-200',
                color: 'text-green-700'
              },
              {
                num: '3',
                icon: <Zap className="w-6 h-6" />,
                title: 'HOD Approves',
                desc: 'Final authorization from HOD. Get instant notifications.',
                bg: 'bg-yellow-200',
                color: 'text-yellow-700'
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 border border-purple-200 hover:shadow-lg transition-shadow">
                <div className={`${step.bg} ${step.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for Everyone */}
      <section className="bg-gradient-to-b from-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Built for everyone</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Whether you're a student, coordinator, or HOD, LeaveHub has you covered</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '👨‍🎓',
                title: 'For Students',
                subtitle: 'Seamless leave management',
                features: [
                  'Easy signup with college email',
                  'Real-time request tracking',
                  'View approval history'
                ],
                color: 'border-purple-300',
                bg: 'bg-purple-50'
              },
              {
                emoji: '👨‍💼',
                title: 'For Coordinators',
                subtitle: 'Efficient approval workflow',
                features: [
                  'Dashboard of pending requests',
                  'Add comments and feedback',
                  'Forward to HOD with notes'
                ],
                color: 'border-green-300',
                bg: 'bg-green-50'
              },
              {
                emoji: '👨‍🏫',
                title: 'For HODs',
                subtitle: 'Final authorization made simple',
                features: [
                  'Review coordinator feedback',
                  'Make final decisions',
                  'Track all department requests'
                ],
                color: 'border-yellow-300',
                bg: 'bg-yellow-50'
              }
            ].map((role, idx) => (
              <div key={idx} className={`${role.bg} border-2 ${role.color} rounded-xl p-8 hover:shadow-lg transition-shadow`}>
                <div className="text-5xl mb-4">{role.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{role.title}</h3>
                <p className="text-gray-600 mb-6">{role.subtitle}</p>
                <ul className="space-y-3">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-400 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to streamline your leave process?
          </h2>
          <p className="text-xl text-white mb-10">
            Join Madhav Institute of Technology and Science and manage leaves efficiently.
          </p>
          <Link href="/auth/signup">
            <Button className="bg-white text-purple-600 hover:bg-purple-50 px-10 py-6 text-lg font-semibold rounded-full h-auto">
              Sign Up
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-white">LeaveHub</span>
            </div>
            <p className="text-center md:text-right text-gray-500">
              © 2024 Madhav Institute of Technology and Science. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
