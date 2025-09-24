'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Globe,
  Brain,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const statsCards = [
    {
      title: "Active Courses",
      value: "4",
      description: "Currently enrolled",
      icon: BookOpen,
      trend: "+2 this month"
    },
    {
      title: "Study Hours",
      value: "127",
      description: "Total this month",
      icon: Clock,
      trend: "+15% from last month"
    },
    {
      title: "Collaborations",
      value: "12",
      description: "Active sessions",
      icon: Users,
      trend: "+3 new this week"
    },
    {
      title: "Performance",
      value: "87%",
      description: "Average score",
      icon: TrendingUp,
      trend: "+5% improvement"
    }
  ];

  const recentActivities = [
    {
      type: "course",
      title: "Completed: Advanced Mathematics",
      time: "2 hours ago",
      icon: BookOpen
    },
    {
      type: "collaboration",
      title: "Joined study group: Physics 101",
      time: "4 hours ago",
      icon: Users
    },
    {
      type: "message",
      title: "New message from Dr. Johnson",
      time: "1 day ago",
      icon: MessageSquare
    },
    {
      type: "ai",
      title: "AI Notes: Biology summary ready",
      time: "1 day ago",
      icon: Brain
    }
  ];

  const upcomingEvents = [
    {
      title: "Virtual Study Session",
      description: "Mathematics Review with Translation",
      time: "Today, 3:00 PM",
      participants: 8
    },
    {
      title: "AI-Powered Quiz",
      description: "Physics Chapter 5 Assessment",
      time: "Tomorrow, 10:00 AM",
      participants: 15
    },
    {
      title: "Global Collaboration",
      description: "International Student Exchange",
      time: "Friday, 2:00 PM",
      participants: 24
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your learning today.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BookOpen className="mr-2 h-4 w-4" />
            Start Learning
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <activity.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Don't miss these learning opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{event.time}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="mr-1 h-3 w-3" />
                        {event.participants} participants
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your learning experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 justify-start">
                <Globe className="mr-3 h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Start Translation</div>
                  <div className="text-sm text-gray-500">Real-time language support</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 justify-start">
                <Brain className="mr-3 h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">AI Summarize</div>
                  <div className="text-sm text-gray-500">Generate smart notes</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 justify-start">
                <Users className="mr-3 h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Join Collaboration</div>
                  <div className="text-sm text-gray-500">Connect with peers</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}