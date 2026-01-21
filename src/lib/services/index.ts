// Database Service Layer
// Export all services for easy import

export * from './employeeService';
export * from './leaveService';
export * from './documentService';
export * from './settingsService';

// Re-export prisma client
export { default as prisma } from '@/lib/db';
