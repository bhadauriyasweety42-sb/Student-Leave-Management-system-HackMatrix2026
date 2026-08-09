'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please enter email and password')
        setLoading(false)
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get user data from localStorage
      const userDataStr = localStorage.getItem(email)
      
      if (!userDataStr) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      const userData = JSON.parse(userDataStr)

      // Verify password matches
      if (userData.password !== password) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Check if user role matches selected role
      if (userData.role !== activeTab) {
        setError(`This account is registered as a ${userData.role}, not a ${activeTab}`)
        setLoading(false)
        return
      }

      // Create session with user data
      localStorage.setItem('currentUser', JSON.stringify({ 
        email, 
        role: activeTab,
        fullName: userData.fullName,
        rollNumber: userData.rollNumber,
        department: userData.department,
        academicYear: userData.academicYear,
        semester: userData.semester,
        phoneNumber: userData.phoneNumber
      }))

      // Redirect based on role
      if (activeTab === 'student') {
        router.push('/dashboard/student')
      } else if (activeTab === 'coordinator') {
        router.push('/dashboard/coordinator')
      } else if (activeTab === 'hod') {
        router.push('/dashboard/hod')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:bg-background">
      {/* Back Button in Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 bg-white dark:bg-card px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-foreground">LeaveHub</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">Welcome Back</h1>
          <p className="text-gray-600 dark:text-muted-foreground">Sign in to manage your leave requests</p>
        </div>

        <Card className="border-purple-200 shadow-lg bg-white dark:bg-card dark:border-border">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-primary">Sign In</CardTitle>
            <CardDescription>Select your role and enter your email</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-purple-100">
                <TabsTrigger value="student" className="text-xs data-[state=active]:bg-purple-400 data-[state=active]:text-white">Student</TabsTrigger>
                <TabsTrigger value="coordinator" className="text-xs data-[state=active]:bg-purple-400 data-[state=active]:text-white">Coordinator</TabsTrigger>
                <TabsTrigger value="hod" className="text-xs data-[state=active]:bg-purple-400 data-[state=active]:text-white">HOD</TabsTrigger>
              </TabsList>

              {['student', 'coordinator', 'hod'].map((role) => (
                <TabsContent key={role} value={role}>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={role === 'student' ? 'ENTER YOUR EMAIL ADDRESS' : `ENTER YOUR ${role.toUpperCase()} EMAIL`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                  <div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <div className="relative">
    <Input
      id="password"
      type={showPassword ? 'text' : 'password'}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="pr-10"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      tabIndex={-1}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  </div>
</div>

                    <Button
                      type="submit"
                      className="w-full bg-purple-400 hover:bg-purple-500 text-white"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-center text-gray-600">
                Don't have a student account? <Link href="/auth/signup" className="text-purple-600 hover:underline font-semibold">Sign Up</Link>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
