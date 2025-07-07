
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, X, Users } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPriority } from '@/types/notification';

interface HRNotificationManagerProps {
  onClose: () => void;
}

const HRNotificationManager: React.FC<HRNotificationManagerProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('medium');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  // Mock employee list - in real app this would come from an API
  const employees = [
    { id: 'H0908033', name: '박판근', department: '인사기획팀' },
    { id: 'H1310159', name: '김남엽', department: '인사팀' },
    { id: 'H1310172', name: '이수한', department: '인사기획팀' },
    { id: 'H1411166', name: '주승현', department: '인사기획팀' },
    { id: 'H1411231', name: '최은송', department: '인사팀' },
    { id: 'H1911042', name: '김민선', department: '인사기획팀' },
    { id: 'H1205006', name: '황정원', department: '인사팀' },
    { id: 'H1501077', name: '조혜인', department: '인사팀' },
    { id: 'H2301040', name: '김민영', department: '인사팀' }
  ];

  const handleRecipientToggle = (employeeId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRecipients(employees.map(emp => emp.id));
  };

  const handleClearAll = () => {
    setSelectedRecipients([]);
  };

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim() || selectedRecipients.length === 0) {
      return;
    }

    selectedRecipients.forEach(recipientId => {
      addNotification({
        type: 'hr_message',
        title,
        message,
        priority,
        senderId: user?.id || 'hr',
        senderName: user?.name || 'HR 담당자',
        recipientId
      });
    });

    // Reset form
    setTitle('');
    setMessage('');
    setPriority('medium');
    setSelectedRecipients([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">알림 발송</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="알림 제목을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="message">내용</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="알림 내용을 입력하세요"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="priority">중요도</Label>
              <Select value={priority} onValueChange={(value: NotificationPriority) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>수신자 선택</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    <Users className="h-3 w-3 mr-1" />
                    전체 선택
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearAll}>
                    선택 해제
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {employees.map((employee) => (
                    <label
                      key={employee.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(employee.id)}
                        onChange={() => handleRecipientToggle(employee.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{employee.department}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {selectedRecipients.length > 0 && (
                <div className="mt-2">
                  <Badge variant="outline">
                    {selectedRecipients.length}명 선택됨
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <div className="text-sm text-gray-600">
            {selectedRecipients.length}명에게 알림이 발송됩니다
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              onClick={handleSendNotification}
              disabled={!title.trim() || !message.trim() || selectedRecipients.length === 0}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Send className="mr-2 h-4 w-4" />
              발송
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HRNotificationManager;
