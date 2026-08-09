'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ArrowLeft, Users, Briefcase, GraduationCap } from 'lucide-react'

export default function SignUpRoleSelection() {
  const router = useRouter()

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Register as a student to request leaves',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'border-purple-300',
      bg: 'bg-purple-50'
    },
    {
      id: 'coordinator',
      title: 'Class Coordinator',
      description: 'Approve student leave requests',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'border-green-300',
      bg: 'bg-green-50'
    },
    {
      id: 'hod',
      title: 'HOD (Head of Department)',
      description: 'Final approval authority for leaves',
      icon: <Users className="w-8 h-8" />,
      color: 'border-yellow-300',
      bg: 'bg-yellow-50'
    }
  ]

  const handleRoleSelect = (roleId: string) => {
    router.push(`/auth/signup/${roleId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Back Button in Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">LeaveHub</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Select Your Role</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose your role to continue with registration</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {roles.map((role) => (
              <Card key={role.id} className={`border-2 ${role.color} ${role.bg} cursor-pointer hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="text-4xl mb-4">{role.icon}</div>
                  <CardTitle className="text-2xl text-gray-900">{role.title}</CardTitle>
                  <CardDescription className="text-gray-600">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
  onClick={() => handleRoleSelect(role.id)}
  className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-4 px-3 rounded-full text-sm whitespace-normal text-center"
>
  Sign Up as {role.title}
</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account? <Link href="/auth/login" className="text-purple-600 hover:underline font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
