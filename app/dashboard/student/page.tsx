"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, LogOut, Plus, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react'
import { xanoFetch, clearAuthToken, getAuthToken } from '@/lib/xano'
import Link from 'next/link'

export default function StudentDashboard() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newRequest, setNewRequest] = useState({
    reason: '',
    leaveType: '',
    numberOfDays: '',
    startDate: '',
    endDate: '',
  })
  const [attachment, setAttachment] = useState<File | null>(null)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function mapStatus(status: string | undefined) {
    // Normalize to canonical statuses used in UI logic
    switch (status) {
      case 'pending_coordinator':
        return 'pending_coordinator'
      case 'pending_hod':
        return 'pending_hod'
      case 'approved':
        return 'approved'
      case 'rejected_by_coordinator':
      case 'rejected_by_hod':
        return 'rejected'
      default:
        return status || 'pending_coordinator'
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case 'pending_coordinator':
        return 'Pending Coordinator Approval'
      case 'pending_hod':
        return 'Pending HOD Approval'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  function mapLeaveRequest(request: any) {
    return {
      ...request,
      id: request.id ?? request.leave_request_id ?? request.request_id,
      studentName: request.studentName ?? request.student_name ?? request.name ?? request.user_name,
      studentEmail: request.studentEmail ?? request.student_email ?? request.email ?? request.user_email,
      numberOfDays: request.total_days ?? request.totalDays ?? request.numberOfDays ?? request.days ?? 0,
      startDate: request.from_date ?? request.startDate ?? request.start_date,
      endDate: request.to_date ?? request.endDate ?? request.end_date,
      createdAt: request.created_at ?? request.createdAt ?? request.created_at ?? new Date().toISOString(),
      status: mapStatus(request.status),
    }
  }

  useEffect(() => {
    const init = async () => {
      // Ensure token exists
      const token = getAuthToken()
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        setLoading(true)

        // Fetch profile
        const profile: any = await xanoFetch('/auth/me', { method: 'GET' }, 'auth')
        if (!profile || profile.role !== 'student') {
          clearAuthToken()
          router.push('/auth/login')
          return
        }

        setStudentData(profile)

        // Fetch leave history for this student (provide required status param)
        const leavesRes: any = await xanoFetch('/me?status=all', { method: 'GET' }, 'leave')
        const normalizedLeaves = Array.isArray(leavesRes)
          ? leavesRes
          : Array.isArray(leavesRes?.items)
            ? leavesRes.items
            : Array.isArray(leavesRes?.data)
              ? leavesRes.data
              : Array.isArray(leavesRes?.leaves)
                ? leavesRes.leaves
                : []
        const mapped = normalizedLeaves.map(mapLeaveRequest)
        setRequests(mapped)
      } catch (err: any) {
        setError(err?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await xanoFetch('/auth/logout', { method: 'POST' }, 'auth')
      } catch (err) {
        // ignore logout errors
      } finally {
        clearAuthToken()
        router.push('/auth/login')
      }
    }

    doLogout()
  }

  const handleNewRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    console.groupCollapsed('[apply-debug] submitting new leave')
    console.log('newRequest state:', newRequest)
    console.log('attachment present:', !!attachment)
    console.groupEnd()
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.numberOfDays || !newRequest.reason) {
      setError('Please fill all required fields')
      return
    }

    // basic date validation
    if (new Date(newRequest.startDate) > new Date(newRequest.endDate)) {
      setError('Start date cannot be after end date')
      return
    }

    // validate numberOfDays matches inclusive date range
    try {
      const from = new Date(newRequest.startDate)
      const to = new Date(newRequest.endDate)
      const diffMs = to.getTime() - from.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
      const provided = Number(newRequest.numberOfDays)
      if (!Number.isFinite(provided) || provided <= 0) {
        setError('Number of days must be a positive number')
        return
      }
      if (provided !== diffDays) {
        setError(`Number of days (${provided}) does not match selected date range (${diffDays} days)`) 
        return
      }
    } catch (err) {
      // ignore parse errors — validation above covers most cases
    }

    setLoading(true)
    try {
      const payload = {
        leave_type: newRequest.leaveType,
        reason: newRequest.reason,
        from_date: newRequest.startDate,
        to_date: newRequest.endDate,
      }

      const body = attachment
        ? (() => {
            const formData = new FormData()
            formData.append('leave_type', payload.leave_type)
            formData.append('reason', payload.reason)
            formData.append('from_date', payload.from_date)
            formData.append('to_date', payload.to_date)
            formData.append('attachment', attachment)
            return formData
          })()
        : JSON.stringify(payload)

      await xanoFetch('/apply', {
        method: 'POST',
        body,
      }, 'leave')

      // Refresh leave history (required status param)
      const leavesRes: any = await xanoFetch('/me?status=all', { method: 'GET' }, 'leave')
      const normalizedLeaves = Array.isArray(leavesRes)
        ? leavesRes
        : Array.isArray(leavesRes?.items)
          ? leavesRes.items
          : Array.isArray(leavesRes?.data)
            ? leavesRes.data
            : Array.isArray(leavesRes?.leaves)
              ? leavesRes.leaves
              : []
      const mapped = normalizedLeaves.map(mapLeaveRequest)
      setRequests(mapped)

      setNewRequest({ reason: '', leaveType: '', numberOfDays: '', startDate: '', endDate: '' })
      setAttachment(null)
      setShowNewRequest(false)
      setSuccess('Leave request submitted successfully and sent to Coordinator.')
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'pending_hod':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending_coordinator':
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200'
      case 'pending_hod':
        return 'bg-yellow-50 border-yellow-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      case 'pending_coordinator':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LeaveHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
              <ArrowLeft className="w-5 h-5" />
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {studentData?.fullName || 'Student'}</h2>
          <p className="text-gray-600">Manage and track your leave requests here</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Coordinator Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'coordinator_approved').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">HOD Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {requests.filter(r => r.status === 'hod_approved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Leave Requests</h3>
              <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit a Leave Request</DialogTitle>
                    <DialogDescription>Fill in the details of your leave request</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleNewRequest} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Leave *</Label>
                      <Input
                        id="reason"
                        placeholder="Medical, Family emergency, etc."
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leaveType">Leave Type *</Label>
                      <Input
                        id="leaveType"
                        placeholder="Sick Leave, Casual Leave, etc."
                        value={newRequest.leaveType}
                        onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attachment">Attachment (optional)</Label>
                      <Input
                        id="attachment"
                        type="file"
                        onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfDays">Number of Days *</Label>
                      <Input
                        id="numberOfDays"
                        type="number"
                        min="1"
                        placeholder="5"
                        value={newRequest.numberOfDays}
                        onChange={(e) => setNewRequest({ ...newRequest, numberOfDays: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newRequest.startDate}
                        onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newRequest.endDate}
                        onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Submit Request
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {requests.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No leave requests yet</p>
                <Button
                  onClick={() => setShowNewRequest(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Your First Request
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className={`border ${getStatusColor(request.status)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(request.status)}
                            <CardTitle className="text-lg">
                              {statusLabel(request.status)}
                            </CardTitle>
                          </div>
                          <CardDescription>{request.reason}</CardDescription>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">
                          {request.numberOfDays} days
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-semibold">{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Date</p>
                          <p className="font-semibold">{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Submitted</p>
                          <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Full Name</Label>
                    <p className="font-semibold">{studentData?.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-semibold">{studentData?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Roll Number</Label>
                    <p className="font-semibold">{studentData?.rollNumber}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Phone Number</Label>
                    <p className="font-semibold">{studentData?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Department</Label>
                    <p className="font-semibold">{studentData?.department}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Academic Year</Label>
                    <p className="font-semibold">{studentData?.academicYear}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Semester</Label>
                    <p className="font-semibold">{studentData?.semester}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">College</Label>
                    <p className="font-semibold">{studentData?.collegeName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
