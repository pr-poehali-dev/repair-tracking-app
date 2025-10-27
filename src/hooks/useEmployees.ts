import { useState, useEffect } from 'react';
import { UserRole } from '@/contexts/AuthContext';

export interface Employee {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

const EMPLOYEES_KEY = 'employees';

const defaultEmployees: Employee[] = [
  {
    id: '1',
    username: 'director',
    fullName: 'Директор Системы',
    role: 'director',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(EMPLOYEES_KEY);
    if (saved) {
      setEmployees(JSON.parse(saved));
    } else {
      setEmployees(defaultEmployees);
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaultEmployees));
    }
  }, []);

  const saveEmployees = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(newEmployees));
  };

  const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    );
    saveEmployees(updated);
  };

  const deleteEmployee = (id: string) => {
    const filtered = employees.filter(emp => emp.id !== id);
    saveEmployees(filtered);
  };

  const toggleActive = (id: string) => {
    const updated = employees.map(emp =>
      emp.id === id ? { ...emp, isActive: !emp.isActive } : emp
    );
    saveEmployees(updated);
  };

  return {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    toggleActive,
  };
}
