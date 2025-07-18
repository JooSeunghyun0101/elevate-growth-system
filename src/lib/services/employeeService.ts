import { supabase } from '../supabase';
import { Employee } from '@/types';
import { apiErrorHandler } from '@/utils/errorHandler';

export const employeeService = {
  // 모든 직원 조회
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 직원 ID로 조회
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows found
        }
        throw error;
      }
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 평가자 ID로 피평가자들 조회
  async getEvaluateesByEvaluator(evaluatorId: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('evaluator_id', evaluatorId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 부서별 직원 조회
  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', department)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  },

  // 직원 정보 업데이트
  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('employee_id', employeeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw apiErrorHandler.handleApiError(error);
    }
  }
}; 