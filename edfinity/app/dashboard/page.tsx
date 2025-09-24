'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Globe,
  Brain,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const statsCards = [
    {
      title: "Active Courses",
      value: "4",
      description: "Currently enrolled",
      icon: BookOpen,
      trend: "+2 this month",
      color: "text-black"
    },
    {
      title: "Study Hours",
      value: "127",
      description: "Total this month",
      icon: Clock,
      trend: "+15% from last month",
      color: "text-black"
    },
    {
      title: "Collaborations",
      value: "12",
      description: "Active sessions",
      icon: Users,
      trend: "+3 new this week",
      color: "text-black"
    },
    {
      title: "Performance",
      value: "87%",
      description: "Average score",
      icon: TrendingUp,
      trend: "+5% improvement",
      color: "text-black"
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
    <div className="min-h-screen bg-white">
      {/* Welcome Section - Apple-like Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-16 pb-24"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-light tracking-tight text-black title">
              Welcome back.
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Continue your learning journey with personalized insights and seamless collaboration.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="pt-8"
            >
              <Button className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-full text-base font-medium transition-all duration-200">
                Continue Learning
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section - Clean Apple-style */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4 + index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="group"
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <stat.icon className="h-8 w-8 text-black" />
                  <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
                </div>

                <div className="space-y-2">
                  <div className="text-4xl font-light tracking-tight text-black title">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    {stat.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.description}
                  </div>
                  <div className="text-sm text-black font-medium pt-2">
                    {stat.trend}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
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