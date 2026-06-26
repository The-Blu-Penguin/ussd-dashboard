export const useMockData = () => {
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
    initialTransactions
  }
}
