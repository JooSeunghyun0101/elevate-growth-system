
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { X, Save, Bell } from 'lucide-react';

interface NotificationSettingsProps {
  onClose: () => void;
}

interface NotificationConfig {
  emailNotifications: boolean;
  systemNotifications: boolean;
  evaluationDeadline: boolean;
  feedbackReminder: boolean;
  weeklyReport: boolean;
  deadlineWarningDays: number;
  reminderFrequency: number;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<NotificationConfig>(() => {
    const saved = localStorage.getItem('notification-config');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      systemNotifications: true,
      evaluationDeadline: true,
      feedbackReminder: true,
      weeklyReport: false,
      deadlineWarningDays: 3,
      reminderFrequency: 7
    };
  });

  const handleConfigChange = (key: keyof NotificationConfig, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('notification-config', JSON.stringify(config));
    toast({
      title: "알림 설정 저장 완료",
      description: "알림 설정이 성공적으로 저장되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">알림 설정</h2>
          <p className="text-muted-foreground">시스템 알림 및 마감일 설정을 관리하세요</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          닫기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            기본 알림 설정
          </CardTitle>
          <CardDescription>전체적인 알림 활성화/비활성화를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>이메일 알림</Label>
              <p className="text-sm text-muted-foreground">
                중요한 알림을 이메일로 받습니다
              </p>
            </div>
            <Switch
              checked={config.emailNotifications}
              onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>시스템 알림</Label>
              <p className="text-sm text-muted-foreground">
                브라우저 내 팝업 알림을 받습니다
              </p>
            </div>
            <Switch
              checked={config.systemNotifications}
              onCheckedChange={(checked) => handleConfigChange('systemNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>평가 관련 알림</CardTitle>
          <CardDescription>평가 프로세스와 관련된 알림을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>평가 마감일 알림</Label>
              <p className="text-sm text-muted-foreground">
                평가 마감일이 다가올 때 알림을 받습니다
              </p>
            </div>
            <Switch
              checked={config.evaluationDeadline}
              onCheckedChange={(checked) => handleConfigChange('evaluationDeadline', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>피드백 작성 알림</Label>
              <p className="text-sm text-muted-foreground">
                피드백 작성이 필요할 때 알림을 받습니다
              </p>
            </div>
            <Switch
              checked={config.feedbackReminder}
              onCheckedChange={(checked) => handleConfigChange('feedbackReminder', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>주간 보고서</Label>
              <p className="text-sm text-muted-foreground">
                주간 평가 진행 현황 보고서를 받습니다
              </p>
            </div>
            <Switch
              checked={config.weeklyReport}
              onCheckedChange={(checked) => handleConfigChange('weeklyReport', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>알림 타이밍 설정</CardTitle>
          <CardDescription>알림이 발송되는 시점을 조정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>마감일 사전 알림 (일)</Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={config.deadlineWarningDays}
              onChange={(e) => handleConfigChange('deadlineWarningDays', parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              마감일 {config.deadlineWarningDays}일 전에 알림을 받습니다
            </p>
          </div>

          <div className="space-y-2">
            <Label>리마인더 주기 (일)</Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={config.reminderFrequency}
              onChange={(e) => handleConfigChange('reminderFrequency', parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              {config.reminderFrequency}일마다 미완료 항목에 대한 리마인더를 받습니다
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          설정 저장
        </Button>
      </div>
    </div>
  );
};
