'use client'

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
import Link from 'next/link'

export default function StudentDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newRequest, setNewRequest] = useState({
    reason: '',
    numberOfDays: '',
    startDate: '',
    endDate: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedHistoryRequest, setSelectedHistoryRequest] = useState<any>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (!user || JSON.parse(user).role !== 'student') {
      router.push('/auth/login')
      return
    }

    setCurrentUser(JSON.parse(user))

    // Fetch student data
    const userData = localStorage.getItem(JSON.parse(user).email)
    if (userData) {
      setStudentData(JSON.parse(userData))
    }

    // Fetch requests
    const savedRequests = localStorage.getItem('leaveRequests')
    if (savedRequests) {
      const allRequests = JSON.parse(savedRequests)
      const userRequests = allRequests.filter((req: any) => req.studentEmail === JSON.parse(user).email)
      setRequests(userRequests)
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    router.push('/auth/login')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null

    if (!file) {
      setSelectedFile(null)
      setFileError('')
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ]
    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
    const fileExtension = file.name.split('.').pop()?.toLowerCase() ?? ''
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setSelectedFile(null)
      setFileError('Please select a PDF, Word, JPG, JPEG, or PNG file.')
      return
    }

    if (file.size > maxSize) {
      setSelectedFile(null)
      setFileError('File size must be 5 MB or less.')
      return
    }

    setSelectedFile(file)
    setFileError('')
  }

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault()

    const request = {
      id: Date.now().toString(),
      studentEmail: currentUser.email,
      studentName: studentData?.fullName,
      reason: newRequest.reason,
      numberOfDays: parseInt(newRequest.numberOfDays),
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      coordinatorApproval: null,
      hodApproval: null,
    }

    const savedRequests = localStorage.getItem('leaveRequests') || '[]'
    const allRequests = JSON.parse(savedRequests)
    allRequests.push(request)
    localStorage.setItem('leaveRequests', JSON.stringify(allRequests))

    setRequests([...requests, request])
    setNewRequest({ reason: '', numberOfDays: '', startDate: '', endDate: '' })
    setSelectedFile(null)
    setFileError('')
    setShowNewRequest(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hod_approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'coordinator_approved':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hod_approved':
        return 'bg-green-50 border-green-200'
      case 'coordinator_approved':
        return 'bg-yellow-50 border-yellow-200'
      case 'rejected':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getFinalStatusLabel = (request: any) => {
    if (request.status === 'hod_approved') return 'Approved'
    if (request.status === 'coordinator_approved') return 'Pending HOD Approval'
    if (request.status === 'pending') return 'Pending Coordinator Approval'
    if (request.status === 'rejected') {
      if (request.coordinatorApproval?.decision === 'reject') return 'Rejected by Coordinator'
      if (request.hodApproval?.decision === 'reject') return 'Rejected by HOD'
      return 'Rejected'
    }
    return 'Pending'
  }

  const getFilteredHistoryRequests = () => {
    return requests.filter((request) => {
      if (historyStatusFilter === 'all') return true
      if (historyStatusFilter === 'pending') {
        return request.status === 'pending' || request.status === 'coordinator_approved'
      }
      if (historyStatusFilter === 'approved') return request.status === 'hod_approved'
      if (historyStatusFilter === 'rejected') return request.status === 'rejected'
      return true
    })
  }

  const filteredHistoryRequests = getFilteredHistoryRequests()

  const getStatusLabel = (status: string) => {
    if (status === 'hod_approved') return 'Approved'
    if (status === 'coordinator_approved') return 'Pending HOD Approval'
    if (status === 'pending') return 'Pending'
    if (status === 'rejected') return 'Rejected'
    return status
  }

  const getTimelineDot = (state: 'completed' | 'current' | 'rejected' | 'pending' | 'not_reached') => {
    switch (state) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'current':
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <span className="block w-3 h-3 rounded-full border border-gray-300 bg-white" />
    }
  }

  const getTimelineState = (request: any) => {
    type TimelineState = 'completed' | 'current' | 'rejected' | 'pending' | 'not_reached'
    const coordinatorDecision = request.coordinatorApproval?.decision as string | undefined
    const hodDecision = request.hodApproval?.decision as string | undefined

    const coordinatorState: TimelineState = coordinatorDecision === 'reject'
      ? 'rejected'
      : coordinatorDecision === 'approve'
      ? 'completed'
      : 'current'

    const hodReviewState: TimelineState = coordinatorDecision === 'approve'
      ? request.hodApproval
        ? 'completed'
        : 'current'
      : 'not_reached'

    const hodDecisionState: TimelineState = coordinatorDecision === 'approve'
      ? request.hodApproval
        ? hodDecision === 'approve'
          ? 'completed'
          : 'rejected'
        : 'pending'
      : 'not_reached'

    const finalState: TimelineState = request.status === 'hod_approved'
      ? 'completed'
      : request.status === 'rejected'
      ? 'rejected'
      : 'current'

    return { coordinatorState, hodReviewState, hodDecisionState, finalState }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-purple-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">LeaveHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
              <ArrowLeft className="w-5 h-5" />
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-muted-foreground dark:hover:text-foreground font-semibold"
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">Welcome, {studentData?.fullName || 'Student'}</h2>
          <p className="text-gray-600 dark:text-muted-foreground">Manage and track your leave requests here</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-foreground">{requests.length}</div>
            </CardContent>
          </Card>

              <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Pending</CardTitle>
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
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">Leave Dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Track your leave overview and submit new requests.</p>
              </div>
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

                    <div className="space-y-2">
                      <Label htmlFor="supportingDocument">Supporting Document</Label>
                      <Input
                        id="supportingDocument"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      <p className="text-sm text-gray-500 dark:text-muted-foreground">
                        Optional: Upload a medical certificate or other supporting document. PDF, Word, JPG, JPEG, PNG — Max 5 MB.
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-gray-700 dark:text-muted-foreground flex items-center gap-2">
                          <span>📎</span>
                          {selectedFile.name}
                        </p>
                      )}
                      {fileError && (
                        <p className="text-sm text-red-600">{fileError}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Submit Request
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-foreground">{requests.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {requests.filter((r) => r.status === 'pending' || r.status === 'coordinator_approved').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {requests.filter((r) => r.status === 'hod_approved').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground">History</h3>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">Review your past leave requests and their current status.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setHistoryStatusFilter(status as typeof historyStatusFilter)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${historyStatusFilter === status ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-card dark:text-muted-foreground dark:border dark:border-border'}`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistoryRequests.length === 0 ? (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
                <p className="text-gray-600 dark:text-muted-foreground mb-4">No history found for the selected filter.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredHistoryRequests.map((request) => (
                  <Card key={request.id} className={`border ${getStatusColor(request.status)} dark:bg-card dark:border-border`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(request.status)}
                            <CardTitle className="text-lg capitalize dark:text-foreground">
                              {getStatusLabel(request.status)}
                            </CardTitle>
                          </div>
                          <CardDescription>{request.reason}</CardDescription>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-muted-foreground">
                          {request.numberOfDays} days
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600 dark:text-muted-foreground">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">Start Date</p>
                          <p>{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">End Date</p>
                          <p>{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-foreground">Submitted</p>
                          <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-gray-600 dark:text-muted-foreground">
                          <p>Current Status: <span className="font-semibold text-gray-900 dark:text-foreground">{getFinalStatusLabel(request)}</span></p>
                          <p>Coordinator Decision: <span className="font-semibold text-gray-900 dark:text-foreground">{request.coordinatorApproval?.decision === 'approve' ? 'Approved' : request.coordinatorApproval?.decision === 'reject' ? 'Rejected' : 'Pending'}</span></p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedHistoryRequest(request)
                            setHistoryDialogOpen(true)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={historyDialogOpen} onOpenChange={(open) => {
              setHistoryDialogOpen(open)
              if (!open) setSelectedHistoryRequest(null)
            }}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Request Details</DialogTitle>
                  <DialogDescription>Review the selected leave request details and timeline.</DialogDescription>
                </DialogHeader>
                {selectedHistoryRequest ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600 dark:text-muted-foreground">Student Name</Label>
                        <p className="font-semibold text-gray-900 dark:text-foreground">{selectedHistoryRequest.studentName}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-muted-foreground">Leave Reason</Label>
                        <p className="font-semibold text-gray-900 dark:text-foreground">{selectedHistoryRequest.reason}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-muted-foreground">Start Date</Label>
                        <p className="font-semibold text-gray-900 dark:text-foreground">{new Date(selectedHistoryRequest.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600 dark:text-muted-foreground">End Date</Label>
                        <p className="font-semibold text-gray-900 dark:text-foreground">{new Date(selectedHistoryRequest.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-card border border-gray-200 dark:border-border">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-3">Processing Timeline</h4>
                      <div className="space-y-5 border-l border-gray-200 dark:border-border pl-5">
                        <div className="relative">
                          <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-[color:var(--chart-1)]">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-gray-900 dark:text-foreground">Application Submitted</p>
                              {selectedHistoryRequest.createdAt && (
                                <span className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(selectedHistoryRequest.createdAt).toLocaleString()}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-muted-foreground">Your leave application was submitted.</p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-gray-500">
                            {getTimelineDot(getTimelineState(selectedHistoryRequest).coordinatorState)}
                          </span>
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <p className={`text-sm font-semibold ${getTimelineState(selectedHistoryRequest).coordinatorState === 'rejected' ? 'text-red-700' : getTimelineState(selectedHistoryRequest).coordinatorState === 'completed' ? 'text-green-700' : 'text-gray-900'}`}>
                                Coordinator Review
                              </p>
                              <span className="text-xs text-gray-500">
                                {getTimelineState(selectedHistoryRequest).coordinatorState === 'completed'
                                  ? 'Approved'
                                  : getTimelineState(selectedHistoryRequest).coordinatorState === 'rejected'
                                  ? 'Rejected'
                                  : 'Pending'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {getTimelineState(selectedHistoryRequest).coordinatorState === 'rejected'
                                ? 'The coordinator has rejected this request.'
                                : 'Awaiting coordinator decision.'}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-gray-500">
                            {getTimelineDot(getTimelineState(selectedHistoryRequest).hodReviewState)}
                          </span>
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <p className={`text-sm font-semibold ${getTimelineState(selectedHistoryRequest).hodReviewState === 'completed' ? 'text-green-700' : getTimelineState(selectedHistoryRequest).hodReviewState === 'current' ? 'text-blue-700' : 'text-gray-900'}`}>
                                HOD Review
                              </p>
                              <span className="text-xs text-gray-500">
                                {getTimelineState(selectedHistoryRequest).hodReviewState === 'completed'
                                  ? 'Completed'
                                  : getTimelineState(selectedHistoryRequest).hodReviewState === 'current'
                                  ? 'Pending'
                                  : 'Locked'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {getTimelineState(selectedHistoryRequest).hodReviewState === 'current'
                                ? 'Awaiting HOD review.'
                                : getTimelineState(selectedHistoryRequest).hodReviewState === 'not_reached'
                                ? 'Coordinator approval required first.'
                                : 'HOD review is complete.'}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-gray-500">
                            {getTimelineDot(getTimelineState(selectedHistoryRequest).hodDecisionState)}
                          </span>
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <p className={`text-sm font-semibold ${getTimelineState(selectedHistoryRequest).hodDecisionState === 'rejected' ? 'text-red-700' : getTimelineState(selectedHistoryRequest).hodDecisionState === 'completed' ? 'text-green-700' : 'text-gray-900'}`}>
                                HOD Decision
                              </p>
                              <span className="text-xs text-gray-500">
                                {getTimelineState(selectedHistoryRequest).hodDecisionState === 'completed'
                                  ? 'Approved'
                                  : getTimelineState(selectedHistoryRequest).hodDecisionState === 'rejected'
                                  ? 'Rejected'
                                  : getTimelineState(selectedHistoryRequest).hodDecisionState === 'pending'
                                  ? 'Pending'
                                  : 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {getTimelineState(selectedHistoryRequest).hodDecisionState === 'completed'
                                ? 'HOD has approved the request.'
                                : getTimelineState(selectedHistoryRequest).hodDecisionState === 'rejected'
                                ? 'HOD has rejected the request.'
                                : getTimelineState(selectedHistoryRequest).hodDecisionState === 'pending'
                                ? 'Waiting for HOD decision.'
                                : 'HOD decision has not been reached.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">Select a request to see details.</p>
                )}
              </DialogContent>
            </Dialog>
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
