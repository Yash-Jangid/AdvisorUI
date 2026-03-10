'use client';

import React from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { PredictionHistory } from '@/components/features/prediction/PredictionHistory';
import { Text } from '@/components/atoms/Text';

export default function PredictionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Text variant="h2" weight="bold">My Predictions</Text>
        <PredictionHistory />
      </div>
    </DashboardLayout>
  );
}
