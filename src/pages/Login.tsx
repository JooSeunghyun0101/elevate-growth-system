
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 로그인 로직 구현 시 여기에 추가
    console.log('Login attempt:', { email, password });
    // 임시로 메인 페이지로 이동
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="performance-gradient w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">PM</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Management</h1>
          <p className="text-gray-600">차세대 성과관리 시스템에 오신 것을 환영합니다</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>
              계정 정보를 입력하여 시스템에 접속하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="demo">데모 계정</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full performance-gradient">
                    로그인
                  </Button>
                </form>

                <div className="text-center">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
              </TabsContent>

              <TabsContent value="demo" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    <User className="mr-2 h-4 w-4" />
                    HR 관리자로 체험하기
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    <User className="mr-2 h-4 w-4" />
                    평가자로 체험하기
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                  >
                    <User className="mr-2 h-4 w-4" />
                    피평가자로 체험하기
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">
                  데모 계정으로 시스템의 모든 기능을 체험해보세요
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 Performance Management System</p>
          <p>차세대 성과관리 솔루션</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
