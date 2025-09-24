'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Video,
  Eye,
  Download,
  Clock,
  Globe,
  BarChart3,
  FileText,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock admin data - in real app, this would come from your API
const adminStats = {
  totalUsers: 15847,
  totalCreators: 234,
  totalCourses: 1456,
  totalRevenue: 124500,
  monthlyGrowth: 12.5,
  activeUsers: 8934,
  copyrightClaims: 7,
  pendingPayouts: 15600
};

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', joinDate: '2 hours ago', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'creator', joinDate: '4 hours ago', status: 'active' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'user', joinDate: '1 day ago', status: 'pending' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'creator', joinDate: '2 days ago', status: 'active' },
];

const copyrightClaims = [
  {
    id: 1,
    courseTitle: 'Advanced Physics Concepts',
    creator: 'Dr. Michael Chen',
    claimDate: '3 days ago',
    status: 'pending',
    severity: 'high',
    description: 'Copyright claim from PhysicsEd Inc. regarding video content in Chapter 3'
  },
  {
    id: 2,
    courseTitle: 'Programming Fundamentals',
    creator: 'Emily Rodriguez',
    claimDate: '1 week ago',
    status: 'resolved',
    severity: 'medium',
    description: 'Resolved copyright claim - creator provided proper licensing documentation'
  },
  {
    id: 3,
    courseTitle: 'Business Strategy',
    creator: 'Lisa Chang',
    claimDate: '2 weeks ago',
    status: 'disputed',
    severity: 'low',
    description: 'Disputed claim regarding use of public domain business case studies'
  }
];

const pendingPayouts = [
  { id: 1, creator: 'Dr. Sarah Johnson', amount: 2400, course: 'Advanced Mathematics', earnings: '3 months', status: 'pending' },
  { id: 2, creator: 'Prof. Michael Chen', amount: 1850, course: 'Physics Fundamentals', earnings: '3 months', status: 'approved' },
  { id: 3, creator: 'Emily Rodriguez', amount: 3200, course: 'AI Programming', earnings: '3 months', status: 'pending' },
  { id: 4, creator: 'Dr. James Thompson', amount: 1600, course: 'Global History', earnings: '3 months', status: 'processing' },
];

export default function AdminPage() {
  const { hasPermission, isRole } = useAuth();

  if (!isRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-gray-600">You need administrator permissions to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Platform overview, user management, and revenue analytics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Select defaultValue="7days">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="90days">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Users',
            value: adminStats.totalUsers.toLocaleString(),
            icon: Users,
            change: '+12.5%',
            changeType: 'positive',
            description: 'Active platform users'
          },
          {
            title: 'Total Revenue',
            value: `$${adminStats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            change: '+8.2%',
            changeType: 'positive',
            description: 'Monthly recurring revenue'
          },
          {
            title: 'Courses Created',
            value: adminStats.totalCourses.toLocaleString(),
            icon: Video,
            change: '+15.3%',
            changeType: 'positive',
            description: 'Total courses on platform'
          },
          {
            title: 'Copyright Claims',
            value: adminStats.copyrightClaims.toString(),
            icon: AlertTriangle,
            change: '-2',
            changeType: 'positive',
            description: 'Pending resolution'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {metric.description}
                </p>
                <div className={`text-xs mt-2 ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change} from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="copyright">Copyright Claims</TabsTrigger>
          <TabsTrigger value="payouts">Creator Payouts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Platform Growth
                  </CardTitle>
                  <CardDescription>User registration and course creation trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Active Users (30d)</h4>
                        <p className="text-sm text-gray-600">Daily active platform users</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {adminStats.activeUsers.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Content Creators</h4>
                        <p className="text-sm text-gray-600">Active course creators</p>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {adminStats.totalCreators}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Monthly Growth</h4>
                        <p className="text-sm text-gray-600">Platform expansion rate</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        +{adminStats.monthlyGrowth}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Global Reach
                  </CardTitle>
                  <CardDescription>Platform usage by region and language</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { region: 'North America', users: 6420, percentage: 42 },
                      { region: 'Europe', users: 4230, percentage: 28 },
                      { region: 'Asia Pacific', users: 3890, percentage: 25 },
                      { region: 'Other Regions', users: 770, percentage: 5 }
                    ].map((region) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{region.region}</h4>
                          <p className="text-sm text-gray-600">{region.users.toLocaleString()} users</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${region.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{region.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Recent User Registrations
                </CardTitle>
                <CardDescription>Latest users who joined the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={user.role === 'creator' ? 'default' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {user.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{user.joinDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Copyright Claims Tab */}
        <TabsContent value="copyright" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Copyright Claims Management
                </CardTitle>
                <CardDescription>Review and manage copyright claims on course content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {copyrightClaims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{claim.courseTitle}</h4>
                            <Badge
                              variant={
                                claim.status === 'pending' ? 'destructive' :
                                claim.status === 'resolved' ? 'default' : 'secondary'
                              }
                              className={
                                claim.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                claim.status === 'pending' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {claim.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                claim.severity === 'high' ? 'border-red-500 text-red-700' :
                                claim.severity === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                'border-gray-500 text-gray-700'
                              }
                            >
                              {claim.severity} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Creator: {claim.creator}</p>
                          <p className="text-sm">{claim.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Reported {claim.claimDate}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {claim.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                              </Button>
                              <Button size="sm">
                                Resolve
                              </Button>
                            </>
                          )}
                          {claim.status === 'resolved' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {claim.status === 'disputed' && (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Creator Payouts
                </CardTitle>
                <CardDescription>Manage revenue sharing and creator payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPayouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium">
                            {payout.creator.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{payout.creator}</h4>
                          <p className="text-sm text-gray-600">{payout.course}</p>
                          <p className="text-xs text-gray-500">Earnings from {payout.earnings}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold">${payout.amount.toLocaleString()}</div>
                          <Badge
                            variant={
                              payout.status === 'approved' ? 'default' :
                              payout.status === 'processing' ? 'secondary' : 'outline'
                            }
                            className={
                              payout.status === 'approved' ? 'bg-green-100 text-green-800' :
                              payout.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {payout.status}
                          </Badge>
                        </div>
                        {payout.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                            <Button size="sm">
                              Approve
                            </Button>
                          </div>
                        )}
                        {payout.status === 'approved' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {payout.status === 'processing' && (
                          <Clock className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Total Pending Payouts</h4>
                      <p className="text-sm text-gray-600">Amount ready for processing</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${adminStats.pendingPayouts.toLocaleString()}
                      </div>
                      <Button size="sm" className="mt-2">
                        Process All Approved
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}