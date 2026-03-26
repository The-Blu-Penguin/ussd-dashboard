import type { LogLevel } from '~/types/api'

export const useMockData = () => {
  // Service Logs Mock Data
  const generateServiceLog = () => {
    const services = ['USSD', 'PAYMENT']
    const levels: LogLevel[] = ['Info', 'Info', 'Info', 'Warning', 'Error']
    const messages = [
      'Incoming session request',
      'Payment processed successfully',
      'Token refreshed',
      'Database query executed',
      'External API call completed',
      'Session timeout',
      'Invalid parameter'
    ]
    
    return { 
       id: `LOG-${Date.now()}`, 
       timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23),
       service: services[Math.floor(Math.random() * services.length)] as string, 
       level: levels[Math.floor(Math.random() * levels.length)] as LogLevel, 
       message: messages[Math.floor(Math.random() * messages.length)] + ` [${Math.floor(Math.random() * 1000)}]`, 
       duration: `${Math.floor(Math.random() * 200)}ms`, 
       statusCode: Math.random() > 0.9 ? 500 : 200
    }
  }

  const initialServiceLogs = [
    { id: 'LOG-102938', timestamp: '2024-03-14 10:32:15.450', service: 'USSD', level: 'Info' as LogLevel, message: 'Incoming session request from +233541234567', duration: '45ms', statusCode: 200 },
    { id: 'LOG-102939', timestamp: '2024-03-14 10:32:10.120', service: 'PAYMENT', level: 'Error' as LogLevel, message: 'Invalid API Key provided for Merchant ID MER-003', duration: '12ms', statusCode: 401, trace: 'Error: Invalid API Key\n    at AuthService.validate (src/auth/service.js:45:12)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)' },
    { id: 'LOG-102940', timestamp: '2024-03-14 10:31:55.800', service: 'PAYMENT', level: 'Info' as LogLevel, message: 'Payment processed successfully for TXN-892341', duration: '1250ms', statusCode: 200 },
    { id: 'LOG-102941', timestamp: '2024-03-14 10:31:40.200', service: 'USSD', level: 'Warning' as LogLevel, message: 'SMS delivery delayed for +233209876543', duration: '5000ms', statusCode: 202 },
    { id: 'LOG-102942', timestamp: '2024-03-14 10:30:05.100', service: 'USSD', level: 'Critical' as LogLevel, message: 'Connection timeout to Merchant Backend (Volta Grains)', duration: '30000ms', statusCode: 504, trace: 'TimeoutError: Connection timed out after 30000ms\n    at HTTPClient.request (src/utils/http.js:120:15)' },
    { id: 'LOG-102943', timestamp: '2024-03-14 10:29:15.300', service: 'PAYMENT', level: 'Info' as LogLevel, message: 'Daily backup completed successfully', duration: '1500ms', statusCode: 200 },
    { id: 'LOG-102944', timestamp: '2024-03-14 10:28:45.600', service: 'USSD', level: 'Info' as LogLevel, message: 'Token refreshed for user admin@vibes.com', duration: '25ms', statusCode: 200 },
  ]

  // Transaction Logs Mock Data
  const initialTransactions = [
    { id: 'TXN-892341', date: '2024-03-14 10:30:22', msisdn: '+233541234567', merchant: 'Kofi Electronics', type: 'Payment', amount: 'GHS 50.00', status: 'Success', method: 'Mobile Money' },
    { id: 'TXN-892342', date: '2024-03-14 10:28:15', msisdn: '+233209876543', merchant: 'Ama Provisions', type: 'Airtime', amount: 'GHS 10.00', status: 'Success', method: 'Airtime' },
    { id: 'TXN-892343', date: '2024-03-14 10:25:00', msisdn: '+233555555555', merchant: 'Tech Solutions', type: 'Subscription', amount: 'GHS 200.00', status: 'Failed', method: 'Mobile Money', error: 'Insufficient Funds' },
    { id: 'TXN-892344', date: '2024-03-14 10:22:45', msisdn: '+233244444444', merchant: 'Accra Mall Pharmacy', type: 'Payment', amount: 'GHS 125.50', status: 'Pending', method: 'Card' },
    { id: 'TXN-892345', date: '2024-03-14 10:15:30', msisdn: '+233277777777', merchant: 'Kumasi Motors', type: 'Payment', amount: 'GHS 4500.00', status: 'Success', method: 'Bank Transfer' },
    { id: 'TXN-892346', date: '2024-03-14 10:10:12', msisdn: '+233266666666', merchant: 'Cape Coast Textiles', type: 'Bill Pay', amount: 'GHS 85.00', status: 'Success', method: 'Mobile Money' },
    { id: 'TXN-892347', date: '2024-03-14 10:05:05', msisdn: '+233500000000', merchant: 'Volta Grains', type: 'Payment', amount: 'GHS 320.00', status: 'Failed', method: 'Mobile Money', error: 'Timeout' },
  ]

  return {
    generateServiceLog,
    initialServiceLogs,
    initialTransactions
  }
}
