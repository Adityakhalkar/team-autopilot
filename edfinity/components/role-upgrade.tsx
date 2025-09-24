'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import InfinityLoader from './infinity-loader';
import {
  GraduationCap,
  Video,
  BarChart3,
  Users,
  Crown,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function RoleUpgrade() {
  const { user, userProfile, updateUserRole, isRole } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUpgradeToCreator = async () => {
    try {
      setIsUpgrading(true);
      setUpgradeStatus('idle');

      await updateUserRole('creator');
      setUpgradeStatus('success');

      // Show success message for 3 seconds
      setTimeout(() => {
        setUpgradeStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Failed to upgrade to creator:', error);
      setUpgradeStatus('error');

      // Hide error message after 5 seconds
      setTimeout(() => {
        setUpgradeStatus('idle');
      }, 5000);
    } finally {
      setIsUpgrading(false);
    }
  };

  const roleFeatures = {
    user: [
      { icon: GraduationCap, text: 'Browse and enroll in courses' },
      { icon: Users, text: 'Join collaborative learning sessions' },
      { icon: BarChart3, text: 'Track your learning progress' }
    ],
    creator: [
      { icon: Video, text: 'Create and publish courses' },
      { icon: Users, text: 'Manage student enrollments' },
      { icon: BarChart3, text: 'Access detailed course analytics' },
      { icon: Crown, text: 'Earn revenue from course sales' }
    ]
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Current Role Status - Apple-like Design */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-light text-black title">Account Type</h2>
              <span className="px-3 py-1 bg-black text-white text-sm font-medium rounded-full">
                {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              </span>
            </div>
            <p className="text-gray-600">Your current account permissions and features</p>
          </div>
          {isRole('creator') && (
            <Crown className="h-8 w-8 text-black" />
          )}
        </div>

        <div className="space-y-4">
          {roleFeatures[userProfile.role as keyof typeof roleFeatures]?.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <feature.icon className="h-5 w-5 text-black" />
              <span className="text-gray-900">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade to Creator */}
      {isRole('user') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Become a Creator
            </CardTitle>
            <CardDescription>
              Unlock powerful tools to create and monetize your educational content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Creator Benefits */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Creator Benefits
              </h4>
              <div className="space-y-3 ml-7">
                {roleFeatures.creator.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Upgrade Status Messages */}
            {upgradeStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Congratulations! You're now a Creator. Refresh the page to see your new permissions.
                </span>
              </motion.div>
            )}

            {upgradeStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">
                  Failed to upgrade account. Please try again or contact support.
                </span>
              </motion.div>
            )}

            {/* Upgrade Button */}
            <Button
              onClick={handleUpgradeToCreator}
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isUpgrading ? (
                <>
                  <InfinityLoader size={16} className="mr-2" />
                  Upgrading Account...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Upgrade to Creator Account
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              This upgrade is instant and free. You can start creating courses immediately after upgrading.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Creator Success Message */}
      {isRole('creator') && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto" />
              <h3 className="font-semibold text-green-800">You're a Creator!</h3>
              <p className="text-green-700 text-sm">
                You now have access to all creator tools. Start building your first course!
              </p>
              <Button asChild variant="outline" className="mt-4">
                <a href="/dashboard/create-course">
                  <Video className="mr-2 h-4 w-4" />
                  Create Your First Course
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}